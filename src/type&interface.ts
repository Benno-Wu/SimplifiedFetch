/**
 * basic config
 * @remarks RequestInit {@link https://developer.mozilla.org/en-US/docs/Web/API/Request/Request | MDN}
 * @public
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
     * not supported in dynamic config
     * @defaultValue `false`
     */
    enableAbort?: boolean | number
    /**
     * set ture will get return Response.clone()
     * @defaultValue `false`
     */
    pureResponse?: boolean
    /**
     * add suffix for url
     * @example
     * .do .json
     */
    suffix?: string
    /**
     * any, used for custom config, reuse it in pipeline
     */
    custom?: any
}

/**
 * Http(s) request methods
 * @remarks
 * {@link https://fetch.spec.whatwg.org/#concept-method | spec}
 * @public
 */
export type Methods = `DELETE` | `GET` | `HEAD` | `OPTIONS` | `POST` | `PUT` | `PATCH`

/**
 * transform the response body
 * @remarks
 * {@link https://fetch.spec.whatwg.org/#body-mixin | spec}
 * @public
 */
export type BodyMixin = 'arrayBuffer' | 'blob' | 'formData' | 'json' | 'text'

/**
 * config of each api
 * @param key - access on Api to fetch
 * @param value - {@link request} | {@link URN}
 * @public
 */
export type APIConfig<apis> = {
    /**
     * support full config and URN
     */
    [api in keyof apis]: request
}

/**
 * config of fetch
 * @public
 */
export type request = URN | {
    /**
     * {@link URN}
     */
    urn: URN,
    /**
     * {@link BaseConfig}
     */
    config?: Omit<BaseConfig, 'newName'>
}

/**
 * rest part of the fetch url, could be a function like {@link urnParser}
 * @remarks
 * the urn could be a complete URL
 * @public
 */
export type URN = string | URNParser
/**
 * params之所以是any是因为URN，这个func要这个参数，再组合出最终url，一来二去就是any了
 * 尝试过使用unknown | Record<keyof any, unknown>
 * 但是apiF的设计是无所谓这里param
 * 所以在约束谁？约束在init/create时，实现APIConfig<apis>时
 * need more work?
 */
/**
 * parser the urn with prarms
 * @public
 */
export type URNParser = (params?: any) => string

/**
 * get AbortController & AbortSignal via [controller, signal]= Api.aborts.someApi
 * {@link iAborts}
 * 
 * pipe: Map<function> which operates Request & Response
 * {@link PipeRequest}
 * {@link PipeResponse}
 * @public
 */
export interface iApi {
    /**
     * get AbortController & AbortSignal via [controller, signal]= Api.aborts.someApi
     */
    aborts: iAborts
    /**
     * Asynchronous executed after internal core operation with url & config, just before fetch
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
 * build-in, automatically generated AbortController & AbortSignal
 * @public
 */
export type iAborts = Record<string, [AbortController, AbortSignal]>
// todo how to type this: Api.aborts.[hint], consider usage
// export type iAborts<apis> = { [api in keyof apis]: [AbortController, AbortSignal] }

/**
 * manage the functions which pipe the request or response
 * @typeParam T- function of {@link PipeRequest}/{@link PipeResponse}
 * @public
 */
export interface iPipe<T> {
    /**
     * local ordered Map
     */
    pipeMap: Map<string, T>
    /**
     * push function(s)
     * @param pipe - function(s) as pipe(s)
     * @returns key(s) for eject
     */
    use: (...pipe: T[]) => string | string[]
    /**
     * eject function(s)
     * @param key - unique key(s) for used function(s)
     * @returns has & eject success?
     */
    eject: (key: string | string[]) => boolean | boolean[]
}

type PipeUnion = PipeRequest | PipeResponse

/**
 * Asynchronous executed after internal core operation with url & config, just before fetch
 * @param url - {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | MDN}
 * @param config - Final Config {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | MDN}
 * @param param - [body, params], Api.someApi(body, params) {@link apiF}
 * @param configs -[api, urn, config, baseConfig] {@link BaseConfig} {@link APIConfig}
 * @remarks
 * only the change to url & config will effect, others are just copy from your init/create config & call params.
 * 
 * function return true or any message, someApi will immediate reject with that, don't forget to catch it.
 * @public
 */
export type PipeRequest = (url: URL, config: BaseConfig,
    param: [bodyAsParams | undefined, any | undefined],
    configs: [string, URN, BaseConfig, BaseConfig]) => unknown

/**
 * Asynchronous executed just after getting the response
 * @param response - {@link https://developer.mozilla.org/en-US/docs/Web/API/Response | MDN}
 * @param request - {@link https://developer.mozilla.org/en-US/docs/Web/API/Request | MDN}
 * @param controller - [resolve, reject] end the pipeline when needed
 * @remarks
 * invoke resolve | reject to end pipeline
 * @public
 */
export type PipeResponse = (response: Response, request: Request,
    controller: [(value: unknown) => void, (reason?: any) => void]) => Promise<unknown> | unknown

/**
 * body of fetch
 * @remarks
 * when method is 'GET'|'HEAD', try parse to string mainly by URLSearchParam
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams | MDN}
 * @public
 */
export type bodyAsParams = string | object | Array<unknown> | BodyInit
/**
 * the access of configed fetch
 * @typeParam Body - the type of param0 body
 * @typeParam Param - the type of param1 params
 * @typeParam Return - the type of return
 * @param body - {@link bodyAsParams}
 * @param params - use for url building
 * @returns Promise\<returns\>
 * @privateRemarks
 * wanted: export type apiF<Body, Return>  & type apiF<Param, Return> and more
 * first thing i want to do, it's something like Function Overloads, Generics are optional,
 * so my search keywords: optional generics, find some issues: #10571, #26242...
 * Suddenly i realize, how to infer in this situation: apiF<Body>, apiF<Param>, usage apiF<any>, which is any?
 * So, optional Generics need full write with some skip, which also means no optional, just give it any.
 * Default generic type variables #2175 may help a little.
 * @public
 */
export type apiF<Body, Param, Return> = (body?: bodyAsParams | Body, params?: any | Param, config?: Omit<BaseConfig, "enableAbort" | 'newName'>) => Promise<Return>
