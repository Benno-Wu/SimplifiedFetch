/**
 * basic config
 * @remarks RequestInit {@link https://developer.mozilla.org/en-US/docs/Web/API/Request/Request | MDN}
 */
export interface BaseConfig extends RequestInit {
    /**
     * name to access the SimplifiedFetch on globalThis
     * @defaultValue `Api`
     */
    newName?: string
    /**
     * basic url
     * @example 
     * http://www.example.com
     * 
     * @remarks
     * if it isn't an absolute URL, it will be ignored.
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/URL | MDN}
    */
    baseURL?: string | URL
    /**
     * default method
     * @defaultValue `GET`
     */
    method?: Methods
    /**
     * how the response will be transformed
     * @defaultValue `json`
     * {@link BodyMixin}
     */
    bodyMixin?: BodyMixin
    /**
     * abort fetch, enable by given true or number(means timeout)
     * @remarks
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortController | MDN}
     * 
     * @defaultValue `false`
     * @beta
     */
    enableAbort?: boolean | number
    /**
     * set ture will get return Response.clone()
     * @defaultValue `false`
     * @beta
     */
    pureResponse?: boolean
    /**
     * add suffix for url
     * @example
     * .do .json
     * @remarks
     * may delete
     * @alpha
     */
    suffix?: string
}

/**
 * Http request methods
 * @remarks
 * {@link https://fetch.spec.whatwg.org/#concept-method | spec}
 */
export type Methods = `DELETE` | `GET` | `HEAD` | `OPTIONS` | `POST` | `PUT` | `PATCH`

/**
 * transform the response body
 * @remarks
 * {@link https://fetch.spec.whatwg.org/#body-mixin | spec}
 */
export type BodyMixin = 'arrayBuffer' | 'blob' | 'formData' | 'json' | 'text'

/**
 * config of each api
 * @param key - access on Api to fetch
 * @param urn - {@link URN}
 * @param config - {@link BaseConfig}
 */
export interface APIConfig {
    [propName: string]: {
        urn: URN
        config?: BaseConfig
    }
}

/**
 * rest part of the fetch url
 * @remarks
 * could be a function like {@link urnParser}
 */
export type URN = string | URNParser

/**
 * function which parser the urn with prarms
 */
export type URNParser = (params?: Array<any>) => string

/**
 * pipe Map<function> which operate Request & Response
 * {@link PipeRequest}
 * {@link PipeResponse}
 * @beta
 */
export interface iApi {
    /**
     * Synchronous executed after internal core operation with url & config, just before fetch
     * {@link PipeRequest}
     */
    request: iPipe<PipeRequest>
    /**
     * Asynchronous executed just after getting the response
     * {@link PipeResponse}
     */
    response: iPipe<PipeResponse>
}

/**
 * manage the functions which pipe the request or response
 */
export interface iPipe<T> {
    /**
     * local ordered Map
     */
    pipeMap: Map<string, T>
    /**
     * push a function
     * @param pipe - function as pipe
     * @returns key for eject
     */
    use: (pipe: T) => string
    /**
     * eject a function
     * @param key - unique key for used function
     * @returns has & eject success?
     */
    eject: (key: string) => boolean
}

export type PipeUnion = PipeRequest | PipeResponse

/**
 * Synchronous executed after internal core operation with url & config, just before fetch
 * @param url - {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | MDN}
 * @param config - {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | MDN}
 * @param param - [body, params], Api.someApi(body, params) {@link apiF}
 * @param configs -[api, urn, config, baseConfig] {@link BaseConfig} {@link APIConfig}
 */
export type PipeRequest = (url: URL, config: BaseConfig
    , param: [string | Object | Array<any> | undefined, Array<any> | undefined]
    , configs: [string, URN, BaseConfig, BaseConfig]) => any

/**
 * Asynchronous executed just after getting the response
 * @param response - {@link https://developer.mozilla.org/en-US/docs/Web/API/Response | MDN}
 * @param request - {@link https://developer.mozilla.org/en-US/docs/Web/API/Request | MDN}
 * @param funcs - [resolve, reject] end the pipeline when needed
 */
export type PipeResponse = (response: Response, request: Request,
    funcs: [(value: unknown) => void, (reason?: any) => void]) => Promise<any>

/**
 * body of fetch
 * @remarks
 * when method is 'GET'|'HEAD', try parse to string mainly by URLSearchParam
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams | MDN}
 */
export type bodyAsParams = string | Object | Array<any>

/**
 * the access of configed fetch
 */
export type apiF = (body?: bodyAsParams, params?: Array<any>) => Promise<any>
