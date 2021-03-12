import { APIConfig, BaseConfig, bodyAsParams, iApi, iPipe, PipeRequest, PipeResponse, URN, URNParser } from "./type&interface";

// issue: so... why is every method static?
export default class API {
    // baseConfig = {}
    // constructor() {
    //     Object.freeze(API.baseConfig)
    // }
    static readonly baseConfig: BaseConfig = {
        method: 'GET',
        bodyMixin: 'json',
        headers: {
            "Content-Type": "application/json",
        },
        enableAbort: false,
        pureResponse: false,
    }
    static init(baseConfig: BaseConfig, apis: APIConfig) {
        (<any>globalThis)[baseConfig?.newName || 'Api']
            = new Api(apis, mergeConfig(API.baseConfig, baseConfig))
    }
    static create(baseConfig: BaseConfig, apis: APIConfig) {
        return new Api(apis, mergeConfig(API.baseConfig, baseConfig))
    }
}

// todo: refactor?
class Api implements iApi {
    request = new Pipe<PipeRequest>()
    response = new Pipe<PipeResponse>()
    constructor(apis: APIConfig, baseConfig: BaseConfig = API.baseConfig) {
        for (const [api, { urn, config = {} }] of Object.entries(apis)) {

            // pipe request
            // issue: unable to be async?
            // issue: how to control the core operation with appropriate fine granularity
            // optional position
            // for (const [key, func] of this.request.pipeMap) {
            //     func()
            // }

            const configMerged: BaseConfig = mergeConfig(baseConfig, config)

            // https://developer.mozilla.org/en-US/docs/Web/API/AbortController
            let controller: AbortController, signal: AbortSignal, abort = configMerged?.enableAbort
            if (abort) {
                controller = new AbortController()
                signal = controller.signal
                configMerged.signal = signal;
                (<any>this).aborts[api] = [controller, signal]
            }

            (<any>this)[api] = (body?: bodyAsParams, params?: Array<any>): Promise<any> => {

                const urlMerged = mergeURL(urn, configMerged, params)
                urlMerged.pathname += configMerged?.suffix ?? ''
                // body=0,'' ? bug
                const urlFinal = body ? getURL(urlMerged, configMerged, body) : urlMerged

                // pipe request
                // too many parameters, but good for bug fix when people use this
                for (const [key, func] of this.request.pipeMap) {
                    func(urlFinal, configMerged, [body, params], [api, urn, config, baseConfig])
                }

                return new Promise((resolve, reject) => {
                    if (typeof abort === 'number') {
                        (<any>signal)['timeout'] = abort
                        setTimeout(controller.abort, abort)
                    }

                    const request = new Request(urlFinal.toString(), configMerged)
                    fetch(request)
                        .then(async response => {

                            // pipe response
                            for (const [key, func] of this.response.pipeMap) {
                                await func(response, request, [resolve, reject])
                            }
                            // too many parameters
                            // await [...this.response.pipeMap.values()].reduce(
                            //     async (result, func, index, array) => await func([resolve, reject], response, request, [result, index, array])
                            //     , undefined)

                            processResponse([resolve, reject], response, configMerged?.bodyMixin, configMerged?.pureResponse)
                        })
                        .catch(e => {
                            // https://developer.mozilla.org/en-US/docs/Web/API/DOMException
                            // if (e?.code === 20) {
                            if (e.name === 'AbortError') {
                                (<any>e)['timeout'] = abort
                            }
                            throw e
                        })
                })
            }
        }
    }
}

class Pipe<T> implements iPipe<T> {
    pipeMap = new Map<string, T>()
    use = (pipe: T): string => {
        const key = Math.random().toString(16).slice(-3)
        this.pipeMap.set(key, pipe)
        return key
    }
    eject = (key: string): boolean => {
        return this.pipeMap.delete(key)
    }
}


function processResponse([resolve, reject]: Array<Function>, response: Response, bodyMixin: string = 'json', pure: boolean = false) {
    const pureResponse: Response | undefined = pure ? response.clone() : undefined;
    (<any>response)[bodyMixin]()
        .then((res: any) => resolve(pure ? [res, pureResponse] : res))
    // .catch(reject)
}

function mergeConfig(baseConfig: BaseConfig, newConfig: BaseConfig): BaseConfig {
    const headers = Object.assign({}, baseConfig?.headers, newConfig?.headers)
    return {
        ...baseConfig,
        ...newConfig,
        headers,
    }
}

function mergeURL(urn: URN, config: BaseConfig, params?: Array<any>): URL {
    // todo: params now is just for urn. if urn isn't function, then auto parse params to string +=url.search
    // why: body is just for body, if wrong method, then parser. this one is done.
    // Both all almost the same thing.

    // https://developer.mozilla.org/zh-CN/docs/Web/API/URL/URL
    return new URL(typeof urn === 'function' ? urn(params) : urn, config?.baseURL ?? '')
}

function getURL(url: URL, config: BaseConfig, body: bodyAsParams): URL {
    const bodyType = Object.prototype.toString.call(body)
    if (['GET', 'HEAD'].includes(config.method!.toUpperCase())) {
        // situation: 'xxx',xxx/','xxx/?','xxx/?a=1','xxx/?a=1&',
        const search = url.search.includes('?')
        // this won't be done automatically on Chromium
        url.search += search && url.search.slice(-1)[0] !== '&' ? '&' : ''

        switch (bodyType) {
            case '[object Object]':
                // issue: bug when strange body comes
                // @ts-ignore
                url.search += new URLSearchParams(body).toString()
                break;
            case '[object FormData]':
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
            case '[object URLSearchParams]':
                url.search += body.toString()
                break
            // this will be done automatically on Chromium
            // todo: more Test?
            // if (search) {
            //     url.search = '?'.concat(url.search)
            // }

            case '[object Array]':
                url.pathname += `/${body.toString()}`
                break;
            case '[object String]':
                url.pathname += `/${body.toString()}`
                break;
            case '[object Number]':
                url.pathname += `/${body.toString()}`
                break;
        }
    } else {
        //  obj2json,exclude
        //  ['[object Blob]','[object ArrayBuffer]','[object FormData]',
        //  '[object URLSearchParams]','[object ReadableStream]','[object String]']
        if (bodyType === '[object Object]' || Array.isArray(body)) {
            body = JSON.stringify(body)
        }
        config.body = <any>body
    }
    return url
}

/**
 * parse the template strings with params
 * 
 * @example
 * ```
 * // init
 * name:{
 *   urn: urnParser(`/xxx/${0}/${1}`)
 * }
 * // somewhere
 * Api.name(body,['user', [1,2,3])
 * // getUrl: /xxx/user/1,2,3
 * ```
 * @param template - template strings
 * @param placeholder - indexes of params, like $\{0\}
 * @returns URNParser
 * @beta
 */
export const urnParser = (template: Array<string>, ...placeholder: Array<number>): URNParser => {
    return (params?: Array<any>): string => {
        return template.reduce((previousValue, currentValue, index) => {
            return previousValue + currentValue + (params?.[placeholder[index]] ?? '')
        }, '')
    }
}
