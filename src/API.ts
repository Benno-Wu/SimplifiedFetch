import { hasOwnProperty, objects, toString } from "./shares";
import type { APIConfig, BaseConfig, bodyAsParams, BodyMixin, iAborts, iApi, iOrderablePipe, iPipe, PipeRequest, PipeResponse, PipeUnion, request, URN, URNParser } from "./type&interface";

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
    static init(baseConfig: BaseConfig, apis: APIConfig<Record<string, request>>): void {
        const _: any = (function () {
            if (typeof globalThis === 'object' && globalThis) return globalThis
            if (typeof window === 'object' && window) return window
            if (typeof self === 'object' && self) return self
            // for node
            if (typeof global === 'object' && global) return global
            throw new Error(`unable to get globalThis, try 'import 'simplified-fetch/polyfill/globalThis'' before init`)
        })()

        _[baseConfig?.newName || 'Api'] = new Api(apis, mergeConfig(API.baseConfig, baseConfig))
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
 */
class Api implements iApi {
    /**
     * for AbortController & AbortSignal
     */
    aborts: iAborts = {}
    /**
     * {@link PipeRequest}
     */
    request = new OrderablePipe<PipeRequest>()
    /**
     * {@link PipeResponse}
     */
    response = new OrderablePipe<PipeResponse>()
    /**
     * constructor of Api, return SimplifiedFetch
     * @param apis - {@link APIConfig}
     * @param baseConfig - {@link BaseConfig}
     */
    constructor(apis: APIConfig<Record<string, request>>, baseConfig: BaseConfig) {
        for (const [api, request] of Object.entries(apis)) {
            let urn: URN, config: Omit<BaseConfig, 'newName'> = {};
            if (typeof request === 'string' || typeof request === 'function') urn = request
            else { ({ urn, config = {} } = request) }

            const configMerged: BaseConfig = mergeConfig(baseConfig, config)

            let controller: AbortController, signal: AbortSignal
            const abort = configMerged?.enableAbort
            if (abort) {
                controller = new AbortController()
                signal = controller.signal
                configMerged.signal = signal;
                this.aborts[api] = [controller, signal]
            }

            (<any>this)[api] = async (body?: bodyAsParams, params?: unknown, dynamicConfig: Omit<BaseConfig, 'enableAbort' | 'newName'> = {}) => {
                // controller of both pipelines
                let isEnd: unknown = false

                const configFinal = mergeConfig(configMerged, dynamicConfig)

                const urlMerged = mergeURL(urn, configFinal, params)
                urlMerged.pathname += configFinal?.suffix ?? ''
                const urlFinal = body != null ? getURL(urlMerged, configFinal, body) : urlMerged

                // pipe request
                // too many parameters, but good for bug fix when people use this
                for (const pipes in this.request.pipeMap)
                    if (hasOwnProperty(this.request.pipeMap, pipes))
                        for (const pipe of this.request.pipeMap[pipes])
                            if (!isEnd && typeof pipe === 'function')
                                isEnd = await pipe(urlFinal, configFinal, [body, params, dynamicConfig], [api, urn, config, baseConfig])

                return new Promise((resolve, reject) => {

                    if (isEnd) { reject(isEnd); return }
                    const res = (_: unknown) => { isEnd = true; resolve(_) }
                    const rej = (_: unknown) => { isEnd = true; reject(_) }

                    if (typeof abort === 'number') {
                        (<any>signal)['timeout'] = abort
                        // setTimeout(controller.abort, abort)
                        // https://dev.to/bil/using-abortcontroller-with-react-hooks-and-typescript-to-cancel-window-fetch-requests-1md4
                        // abortcontroller TypeError: Illegal invocation
                        setTimeout(() => controller.abort(), abort)
                    }

                    const request = new Request(urlFinal.toString(), configFinal)
                    fetch(request)
                        .then(async response => {

                            // pipe response
                            for (const pipes in this.response.pipeMap)
                                if (hasOwnProperty(this.response.pipeMap, pipes))
                                    for (const pipe of this.response.pipeMap[pipes]) {
                                        if (typeof pipe === 'function')
                                            await pipe(response.clone(), request.clone(), [res, rej])
                                        if (isEnd) return
                                    }

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
 * manage orderable functions which pipe the request or response,
 * based on feature [Ordinary OwnPropertyKeys](https://262.ecma-international.org/6.0/#sec-ordinary-object-internal-methods-and-internal-slots-ownpropertykeys)
 * @remarks
 * [array index | Integer indix](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#array-index)
 * 
 * {@link iOrderablePipe}
 */
class OrderablePipe<T extends PipeUnion> implements iOrderablePipe<T> {
    /**
     * @remarks
     * [Dr. Axel Rauschmayer | exploringjs.com/es6](https://exploringjs.com/es6/ch_oop-besides-classes.html#_traversal-order-of-properties)
     * 
     * [stackoverflow | Y2008](https://stackoverflow.com/questions/280713/elements-order-in-a-for-in-loop)
     * 
     * [stackoverflow | Y2012](https://stackoverflow.com/questions/30076219/does-es6-introduce-a-well-defined-order-of-enumeration-for-object-properties)
     * 
     * [ES2015](https://262.ecma-international.org/6.0/#sec-ordinary-object-internal-methods-and-internal-slots-ownpropertykeys)
     * 
     * [ES2022](https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html#sec-ordinaryownpropertykeys)
     * 
     * [10 methods of rounding in JS](https://juejin.cn/post/6901887182375092231)
     * 
     * [performance](https://zhuanlan.zhihu.com/p/28105425)
     */
    pipeMap: Record<number | string, T[]> = {}
    // use = (num: number | string | T, ...pipe: T[]): [number, T[]] => {
    //     // todo delete after 0.5
    //     // if (typeof num === 'number') {
    //     //     const _ = Math.abs(Math.trunc(num))
    //     //     hasOwnProperty(this.pipeMap, _) ? this.pipeMap[_].push(...pipes) : this.pipeMap[_] = pipes
    //     //     return pipes
    //     // } else {
    //     //     hasOwnProperty(this.pipeMap, 0) ? this.pipeMap[0].push(num, ...pipes) : this.pipeMap[0] = [num, ...pipes]
    //     //     return [num, ...pipes]
    //     // }
    //     let order: number, pipes: T[]
    //     // @ts-ignore
    //     typeof num !== 'function' ? (order = Math.abs(Math.trunc(num)), pipes = pipe) : (order = 0, pipes = [num].concat(pipe))
    //     hasOwnProperty(this.pipeMap, order) ? this.pipeMap[order].push(...pipes) : this.pipeMap[order] = pipes
    //     return [order, pipes]
    // }

    // issue about Tuple, related #4988 #17765
    // finally in [#9874](https://github.com/microsoft/TypeScript/issues/9874), label: Too Complex
    use = (...pipe: [number | string | T, ...T[]]): [number, T[]] => {
        let order: number, pipes: T[]
        // @ts-ignore 1.Math.trunc(string) 2.tuple.slice
        typeof pipe[0] !== 'function' ? (order = Math.abs(Math.trunc(pipe[0])), pipes = pipe.slice(1)) : (order = 0, pipes = pipe)
        // !Array.from(pipes)! resolve bug in beforeV0.5->APIConfig type URN test->URN type string, which will eject with length:5
        hasOwnProperty(this.pipeMap, order) ? this.pipeMap[order].push(...pipes) : this.pipeMap[order] = Array.from(pipes)
        return [order, pipes]
    }
    eject = ([num, pipe]: [number | string | T, T[]]): boolean[] => {
        let order: number | string, pipes: T[]
        // @ts-ignore
        typeof num !== 'function' ? (order = Math.abs(Math.trunc(num)), pipes = pipe) : (order = Object.keys(this.pipeMap)?.[0] ?? 0, pipes = [num].concat(pipe))
        const result: boolean[] = Array(pipes.length).fill(false)
        this.pipeMap[order] = this.pipeMap[order].filter((v) => {
            const index = pipes.indexOf(v)
            return index === -1 ? true : (result[index] = true, false)
        })
        return result
    }
}

/**
 * use ordered Map to manage the pipe<function>
 * {@link iPipe}
 * @deprecated
 */
class Pipe<T> implements iPipe<T> {
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
function processResponse([resolve, reject]: [(value: unknown) => void, (reason?: any) => void], response: Response, bodyMixin: BodyMixin = 'json', pure = false) {
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
 * @param params - Api.someApi(body, params, dynamicConfig), use for step: urnParser
 * @returns url wait to fetch
 */
function mergeURL(urn: URN, config: BaseConfig, params?: unknown): URL {
    const base = config?.baseURL ?? undefined
    return typeof urn === 'function' ? new URL(urn(params), base) : appendPathnameOrSearch(params, new URL(urn, base))
}

/**
 * transform body properly to fetch body
 * @param url - {@link https://developer.mozilla.org/en-US/docs/Web/API/URL}
 * @param config - {@link BaseConfig}
 * @param body - {@link bodyAsParams}
 * @returns final url and config for fetch
 */
function getURL(url: URL, config: BaseConfig, body: bodyAsParams): URL {
    // reason: Failed to execute 'fetch' on 'Window': Request with ！GET/HEAD！ method cannot have body.
    // https://fetch.spec.whatwg.org/#request-class constructor step-34
    if (['GET', 'HEAD'].includes(config.method!.toUpperCase())) {
        url = appendPathnameOrSearch(body, url)
    } else {
        //  obj2string,exclude
        //  ['[object Blob]','[object ArrayBuffer]','[object FormData]',
        //  '[object URLSearchParams]','[object ReadableStream]','[object String]']
        if (toString(body) === objects.Object || Array.isArray(body)) {
            body = JSON.stringify(body)
        }
        config.body = body as BodyInit
    }
    return url
}

/**
 * append params | body to URL pathname | search
 * @param end params or body
 * @param url URL
 * @returns URL
 * @remarks
 * type [Object, FormData, URLSearchParams] append to search
 * type [Array, String, Number] append to pathname
 */
function appendPathnameOrSearch(end: any, url: URL): URL {
    const endType = toString(end)
    // https://developer.mozilla.org/en-US/docs/Web/API/FormData
    /*
    You can also pass it directly to the URLSearchParams constructor
    if you want to generate query parameters in the way a <form> would do
    if it were using simple GET submission.
     */
    // https://github.com/microsoft/TypeScript/issues/30584
    if ([objects.Object, objects.FormData, objects.URLSearchParams].includes(endType)) {
        // https://url.spec.whatwg.org/#dom-url-search
        const search = url.search.includes('?')
        // this won't be done automatically
        url.search += search && url.search.slice(-1)[0] !== '&' ? '&' : ''
        // @ts-ignor
        url.search += new URLSearchParams(end).toString()
    } else if ([objects.Array, objects.Number, objects.String].includes(endType)) {
        const pathname = url.pathname.slice(-1)[0] === '/'
        // @ts-ignor
        url.pathname += (pathname ? '' : '/') + end.toString()
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
