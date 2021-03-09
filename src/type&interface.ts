export interface BaseConfig extends RequestInit {
    newName?: string
    baseURL?: string | URL
    method?: Methods
    bodyMixin?: BodyMixin
    enableAbort?: boolean | number
    pureResponse?: boolean
    suffix?: string
}

// https://fetch.spec.whatwg.org/#concept-method
export type Methods = `DELETE` | `GET` | `HEAD` | `OPTIONS` | `POST` | `PUT` | `PATCH`

// https://fetch.spec.whatwg.org/#dom-body-json
export type BodyMixin = 'arrayBuffer' | 'blob' | 'formData' | 'json' | 'text'

export interface APIConfig {
    [propName: string]: {
        urn: URN
        config?: BaseConfig
    }
}

export type URN = string | URNParser

export type URNParser = (params?: Array<any>) => string

export interface iApi {
    request: iPipe<PipeRequest>
    response: iPipe<PipeResponse>
}

export interface iPipe<T> {
    pipeMap: Map<string, T>
    use: (pipe: T) => string
    eject: (key: string) => boolean
}

export type PipeUnion = PipeRequest | PipeResponse
export type PipeRequest = (url: URL, config: BaseConfig
    , param: [string | Object | Array<any> | undefined, Array<any> | undefined]
    , configs: [string, URN, BaseConfig, BaseConfig]) => any
export type PipeResponse = (response: Response, request: Request,
    funcs: [(value: unknown) => void, (reason?: any) => void]) => Promise<any>

export type bodyAsParams = string | Object | Array<any>

export type apiF = (body?: bodyAsParams, params?: Array<any>) => Promise<any>
