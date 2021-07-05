import { objects, toString } from "./shares";
import { APIConfig, BaseConfig, bodyAsParams, BodyMixin, iAborts, iApi, iPipe, PipeRequest, PipeResponse, request, URN, URNParser } from "./type&interface";

/**
 * main entry to generate the SimplifiedFetch
 * @public
 */
export default class API {
    /**
     * global basic config
     * @defaultValue
     * ```json
     * method: 'GET',
     * bodyMixin: 'json',
     * headers: {
     *    "Content-Type": "application/json",
     * },
     * enableAbort: false,
     * pureResponse: false,
     * ```
     */
    static readonly baseConfig: BaseConfig = {
        method: 'GET',
        bodyMixin: 'json',
        headers: {
            "Content-Type": "application/json",
        },
        enableAbort: false,
        pureResponse: false,
    }

    /**
     * init Api or [newName] on globalThis
     * @param baseConfig - {@link BaseConfig}
     * @param apis - {@link APIConfig}
     */
    static init(baseConfig: BaseConfig, apis: APIConfig<Record<string, request>>) {
        let _: any = (function () {
            if (typeof globalThis === 'object' && globalThis) return globalThis
            if (typeof window === 'object' && window) return window
            if (typeof self === 'object' && self) return self
            // for node
            if (typeof global === 'object' && global) return global
            throw new Error(`unable to get globalThis, try 'import 'simplified-fetch/polyfill/globalThis'' before init`)
        })()

        _[baseConfig?.newName || 'Api']
            = new Api(apis, mergeConfig(API.baseConfig, baseConfig))
    }
    /**
     * create and return the new Api
     * @param baseConfig - {@link BaseConfig}
     * @param apis - {@link APIConfig}
     * @returns SimplifiedFetch
     */
    static create(baseConfig: BaseConfig, apis: APIConfig<Record<string, request>>): iApi {
        return new Api(apis, mergeConfig(API.baseConfig, baseConfig))
    }
}

/**
 * The unified API request object, also 'SimplifiedFetch'
 * @remarks
 * refactor maybe
 */
class Api implements iApi {
    /**
     * for AbortController & AbortSignal
     */
    aborts: iAborts = {}
    /**
     * {@link PipeRequest}
     */
    request = new Pipe<PipeRequest>()
    /**
     * {@link PipeResponse}
     */
    response = new Pipe<PipeResponse>()
    /**
     * constructor of Api, return SimplifiedFetch
     * @param apis - {@link APIConfig}
     * @param baseConfig - {@link BaseConfig}
     */
    constructor(apis: APIConfig<Record<string, request>>, baseConfig: BaseConfig) {
        for (const [api, request] of Object.entries(apis)) {
            let urn: URN, config: BaseConfig = {};
            if (typeof request === 'string' || typeof request === 'function') urn = request
            else { ({ urn, config = {} } = request) }

            // pipe request
            // issue: unable to be async?
            // issue: how to control the core operation with appropriate fine granularity
            // optional position
            // for (const [key, func] of this.request.pipeMap) {
            //     func()
            // }

            const configMerged: BaseConfig = mergeConfig(baseConfig, config)

            let controller: AbortController, signal: AbortSignal, abort = configMerged?.enableAbort
            if (abort) {
                controller = new AbortController()
                signal = controller.signal
                configMerged.signal = signal;
                this.aborts[api] = [controller, signal]
            }

            (<any>this)[api] = async (body?: bodyAsParams, params?: unknown, dynamicConfig: BaseConfig = {}) => {
                // controller of both pipelines
                let isEnd: unknown = false

                const configFinal = mergeConfig(configMerged, dynamicConfig)

                const urlMerged = mergeURL(urn, configFinal, params)
                urlMerged.pathname += configFinal?.suffix ?? ''
                const urlFinal = body ? getURL(urlMerged, configFinal, body) : urlMerged

                // pipe request
                // too many parameters, but good for bug fix when people use this
                for (const [key, func] of this.request.pipeMap) {
                    if (!isEnd && typeof func === 'function') {
                        isEnd = await func(urlFinal, configFinal, [body, params], [api, urn, config, baseConfig])
                    }
                }

                return new Promise((resolve, reject) => {

                    if (!!isEnd) { reject(isEnd); return }
                    const res = (_: unknown) => { isEnd = true; resolve(_) }
                    const rej = (_: unknown) => { isEnd = true; reject(_) }

                    if (typeof abort === 'number') {
                        (<any>signal)['timeout'] = abort
                        // setTimeout(controller.abort, abort)
                        // http://cncc.bingj.com/cache.aspx?q=abortcontroller+TypeError%3a+Illegal+invocation&d=4529919372958838&mkt=zh-CN&setlang=zh-CN&w=_Kx5vzyg9zAL-DC-uiwBRYUEGu1ci6oI
                        // abortcontroller TypeError: Illegal invocation
                        setTimeout(() => controller.abort(), abort)
                    }

                    const request = new Request(urlFinal.toString(), configFinal)
                    fetch(request)
                        .then(async response => {

                            // pipe response
                            for (const [key, func] of this.response.pipeMap) {
                                if (typeof func === 'function')
                                    await func(response.clone(), request, [res, rej])
                                if (!!isEnd) return
                            }
                            // too many parameters
                            // await [...this.response.pipeMap.values()].reduce(
                            //     async (result, func, index, array) => await func([resolve, reject], response, request, [result, index, array])
                            //     , undefined)

                            processResponse([resolve, reject], response, configFinal?.bodyMixin, configFinal?.pureResponse)
                        })
                        .catch(e => {
                            // https://developer.mozilla.org/en-US/docs/Web/API/DOMException
                            // if (e?.code === 20) {
                            if (e.name === 'AbortError' && typeof abort === 'number') {
                                (<any>e)['timeout'] = abort
                            }
                            reject(e)
                        })
                })
            }
        }
    }
}

/**
 * use ordered Map to manage the pipe<function>
 * {@link iPipe}
 */
class Pipe<T> implements iPipe<T> {
    // update ts
    // use private?
    // orderedMap 二维数组?
    // use(number, ...func) typeof numebr == number? order
    pipeMap = new Map<string, T>()
    use = (..._: T[]): string | string[] => {
        const key: string[] = []
        _.forEach(v => {
            const __ = Math.random().toString(16).slice(-3)
            this.pipeMap.set(__, v)
            key.push(__)
        })
        return key.length === 1 ? key[0] : key
    }
    eject = (key: string | string[]): boolean | boolean[] => {
        const _ = new Array<string>().concat(key)
        const result: boolean[] = []
        _.forEach(v => {
            result.push(this.pipeMap.delete(v))
        })
        return result.length === 1 ? result[0] : result
    }
}

/**
 * transform the response and resolve([pure response, res] or res)
 * @param param0 - [resolve, reject] end the pipeline
 * @param response - origin pure response, {@link https://developer.mozilla.org/en-US/docs/Web/API/Response}
 * @param bodyMixin - {@link BodyMixin}
 * @param pure - get from config, whether resolve with Response.clone()
 */
function processResponse([resolve, reject]: Array<Function>, response: Response, bodyMixin: BodyMixin = 'json', pure: boolean = false) {
    const pureResponse: Response | undefined = pure ? response.clone() : undefined;
    response[bodyMixin]()
        .then((res: unknown) => resolve(pure ? [res, pureResponse] : res))
    // .catch(reject)
}

/**
 * merge globalConfig with localConfig
 * @param baseConfig - {@link BaseConfig}
 * @param newConfig - {@link BaseConfig}
 * @remarks
 * shallow copy custom when it's simple object, otherwise replace. 
 * @returns new object with final config
 */
function mergeConfig(baseConfig: BaseConfig, newConfig: BaseConfig): BaseConfig {
    const headers = Object.assign({}, baseConfig?.headers, newConfig?.headers)
    return (toString(baseConfig?.custom) === objects.Object || toString(newConfig?.custom) === objects.Object) ? {
        ...baseConfig, ...newConfig, headers, custom: Object.assign({}, baseConfig?.custom, newConfig?.custom)
    } : { ...baseConfig, ...newConfig, headers, }
}

/**
 * merge all configs
 * @param configs - array of {@link BaseConfig}
 * @returns final config
 */
function mergeConfigs(...configs: BaseConfig[]) {
    return configs.reduce((pre, cur, i, a) => mergeConfig(pre, cur), {})
}

/**
 * generate fetch url
 * @param urn - {@link URN}
 * @param config - {@link BaseConfig}
 * @param params - Api.someApi(body, params), use for step: urnParser
 * @returns url wait to fetch
 */
function mergeURL(urn: URN, config: BaseConfig, params?: unknown): URL {
    // todo: params now is just for urn when it's function. if urn isn't function, then auto parse params to string +=url.search
    // reason: body is just for body, if get wrong method, then parse. it is already done.
    // Both do the same thing, so which one first?

    // todo params is simple obj, parse into urlSearchParam, add to search

    // https://developer.mozilla.org/en-US/docs/Web/API/URL/URL
    return new URL(typeof urn === 'function' ? urn(params) : urn, config?.baseURL ?? '')
}

/**
 * transform user's body properly tn fetch's body
 * @param url - {@link https://developer.mozilla.org/en-US/docs/Web/API/URL}
 * @param config - {@link BaseConfig}
 * @param body - {@link bodyAsParams}
 * @returns final url and config for fetch
 */
function getURL(url: URL, config: BaseConfig, body: bodyAsParams): URL {
    const bodyType = toString(body)
    // reasons: Failed to execute 'fetch' on 'Window': Request with ！GET/HEAD！ method cannot have body.
    if (['GET', 'HEAD'].includes(config.method!.toUpperCase())) {
        // situation: 'xxx',xxx/','xxx/?','xxx/?a=1','xxx/?a=1&',
        const search = url.search.includes('?')
        // this won't be done automatically on Chromium
        url.search += search && url.search.slice(-1)[0] !== '&' ? '&' : ''

        switch (bodyType) {
            case objects.Object:
                // issue: bug when strange body comes
                // @ts-ignore
                url.search += new URLSearchParams(body).toString()
                break;
            case objects.FormData:
                // https://developer.mozilla.org/en-US/docs/Web/API/FormData
                /*
                You can also pass it directly to the URLSearchParams constructor
                if you want to generate query parameters in the way a <form> would do
                if it were using simple GET submission.
                 */
                // @ts-ignore
                // https://github.com/microsoft/TypeScript/issues/30584
                url.search += new URLSearchParams(body).toString()
                break;
            case objects.URLSearchParams:
                url.search += body.toString()
                break
            // this will be done automatically on Chromium
            // explain: x.search, get:'', x.search+='a=1', a.search, get:'?a=1'
            // todo: more compatibility Test?
            // if (search) {
            //     url.search = '?'.concat(url.search)
            // }

            case objects.Array:
                url.pathname += `/${body.toString()}`
                break;
            case objects.String:
                url.pathname += `/${body.toString()}`
                break;
            case objects.Number:
                url.pathname += `/${body.toString()}`
                break;
        }
    } else {
        //  obj2string,exclude
        //  ['[object Blob]','[object ArrayBuffer]','[object FormData]',
        //  '[object URLSearchParams]','[object ReadableStream]','[object String]']
        if (bodyType === objects.Object || Array.isArray(body)) {
            body = JSON.stringify(body)
        }
        config.body = body as BodyInit
    }
    return url
}

/**
 * parse the template strings with params
 * 
 * @example
 * ```ts
 * // init|create
 * someApi:{
 *   urn: urnParser`/xxx/${0}/${1}`
 * }
 * // somewhere
 * Api.someApi(body, ['user', [1,2,3]])
 * // getUrl: /xxx/user/1,2,3
 * ```
 * @param template - template strings
 * @param placeholder - indexes of params, like $\{0\}
 * @returns {@link URNParser}
 * 
 * @remarks
 * function base on Template literals (Template strings)
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals | ES6 Template literals}
 * 
 * you do can use the string type as placehloder, and give an object as params, match them with key string.
 * But the way it used would look like: urnParser`/${'key1'}/${'key2'}`, Api.someApi(body, \{key1:'',key2:''\})
 * 
 * Anyway, need better idea.
 * 
 * @public
 */
export const urnParser = (template: Array<string>, ...placeholder: Array<number | string>): URNParser => {
    return params => template.reduce((previousValue, currentValue, index) => {
        // https://github.com/microsoft/TypeScript/issues/10530
        return previousValue + currentValue + (params?.[placeholder[index]] ?? '')
    }, '')
}
