# Simplified Fetch

Encapsulate a unified API request object to simplify the use of [fetch | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) and enhance it!

[![NPM version](https://img.shields.io/npm/v/simplified-fetch?style=flat-square)](https://npmjs.org/package/simplified-fetch)
[![NPM downloads](https://img.shields.io/npm/dm/simplified-fetch?style=flat-square)](https://npmjs.org/package/simplified-fetch)

___support borwser & node.js___

> npm i simplified-fetch

[English](./README.md) | [简体中文](./README_zh-CN.md)

## Usage

```ts
import API, { urnParser } from 'simplified-fetch'

// generate 'Api' on globalThis/window/global(nodejs)
API.init({
    newName?: string, // default:'Api', just for global access
    baseURL?: string | URL,
    method?: Methods, // default:'GET', 'POST', 'PUT'...
    bodyMixin?: BodyMixin, // default:'json', 'text', 'blob', 'formData', 'arrayBuffer'
    enableAbort?: boolean | number, // abort & timeout(ms)
    pureResponse?: boolean, // default:false, whether resolved with Response.clone(), format: [response, pureResponse] or response
    suffix?: string, // like .do .json
    custom?: any, // anything you want to put inside and use it in pipeline
},{
    someApi:{
        urn: string | (params?: any) => string, // build in function: urnParser
        config?: BaseConfig, // same as the above first param
    },
    someApi2:{...},
    someApi3:'/xxx', // string as urn is supported
    someApi4: (param?: any) => string, // function as urn is also supported
})

// somewhere.js
// all params are optional
await Api.someApi(body, params, config)
// enableAbort isn't supported in dynamic config
```
```ts
// support multi instances by create
const api = API.create({...}:BaseConfig, {...}:ApiConfig)
```

>### what is BodyMixin? [body-mixin | whatwg](https://fetch.spec.whatwg.org/#body-mixin)

if you are familiar with fetch, it's just used for normal step response.json() or others.

### Example

```ts
import API from "simplified-fetch"
import type { apiF, iApi, iApi_beta, APIConfig } from "simplified-fetch"

declare global {
    // unable to hint when Api.aborts.someApiEnableAbort
    // var Api: iApi & Apis
    // able to hint when Api.aborts.someApiEnableAbort
    var Api: iApi_beta<typeof configs> & Apis
}

// type your response
type response<T> = {
    body: T,
    ok: boolean, status: number, statusText: string, type: string,
}

interface Apis {
    // you should type your own apiCallFunc, of course, you can bulid on this
    someApi0: apiF<void, void, response<{ api0: number }>>,
    someApi1: apiF<{ api1: number }, number, response<{ api1: string }>>,
    // someApi2: apiF<any, any, response<{ api2: { api2: number } }>>,
}

// comment next line after config all Apis
const configs: APIConfig<Apis> = {
// necessary to enable hint when Api.aborts.someApiEnableAbort
// const configs = {
    someApi0: '/someApi0',
    someApi1: { urn: '/someApi1', config: { method: 'GET' } },
    // someApi2: { urn: '/someApi2', config: { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } } },
} as const

API.init({
    baseURL: 'https://www.example.com',
    method: 'POST',
    mode: 'cors',
}, configs)

Api.request.use((url, config) => {
    // @ts-ignore
    config.headers['Authorization'] = getToken('example')
}, () => 'No Request')

const example = async () => {
    try {
        const { body, ok } = await Api.someApi0()
        const { body: { api1 } } = await Api.someApi1({ api1: 1 }, 1)
    } catch (e) {
        console.warn(e)
    }
}
```

## Config & Ability

- ### default config & BaseConfig extends [RequestInit | whatwg](https://fetch.spec.whatwg.org/#requestinit)
BaseConfig is just an extension of second param of fetch(resource [, init]) [fetch | MDN](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch)

configs are listed in Usage.
```ts
{
  method: 'GET',
  bodyMixin: 'json',
  headers: {
    "Content-Type": "application/json",
  },
  enableAbort: false,
  pureResponse: false,
}
```

- ### urnParser & params
urnParser is based on Template strings or [Template literals | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
#### usage : _executed before body formatter_

if typeof urn is function, then invike it with params, and build url with returned string.

if typeof urn isn't function, then try to transform params and append to the search of URL (for type Object, FormData, URLSearchParams), or append to the pathname of URL (for type Array, String, Number).

```ts
// init
someApi:{
  urn: urnParser`/xxx/${0}/${1}`
}
// somewhere.js
Api.someApi(body, ['user',[1,2,3]], config)
// getUrl: /xxx/user/1,2,3
```
>in a way, you can do anything dynamicly on url, just set the placeholder index on, pass an Array, even an Object (index need to be string like: ${'key'} ).

ps: if you get better idea or create some beautiful way to format the url, please PR!

- ### abort & timeout
[AbortController | MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)

```ts
const [constroller, signal] = Api.aborts.someApi
```
>when you use as timeout, the number is accessible on signal.timeout and (error: AbortError).timeout

- ## pipeline & control
* #### pipeline (Api.request / Api.response)
  * manage orderable functions which pipes before request or after response.
  * pipes with different order executed in __ascending numeric index order__
  * pipes with same order executed in __chronological order__, like queue, first in first executed.
  * based on feature [Ordinary OwnPropertyKeys](https://262.ecma-international.org/6.0/#sec-ordinary-object-internal-methods-and-internal-slots-ownpropertykeys)


* #### use/eject with order
  * use: @param ...pipe - pipe[0] as order should be nonnegative integer, rest should be function(s) as pipe(s). if order is not specified, set order to 0, which means will be executed in the first place.
  * eject: @param pipe - pipe[0] as order should be nonnegative integer, rest should be function(s) as pipe(s). if order is not specified, set order to the value which means executed first or normally 0.
  * order range: +0 ≤ i < 2^32 - 1

* #### PipeRequest
__Asynchronous executed just before fetch and after internal core operation with url & config__
>function: (url: URL, config: BaseConfig, [body, params, dynamicConfig], [someApi, urn, config, baseConfig]) => unknown
>>__only the change to url & config will effect,__ others are just from your init/create config & call params

>Not recommended:
>Change anything in params[2 | 3] will possibly causes bugs

* #### PipeResponse
__Asynchronous executed just after get Response__
>function: (response: Response, request: Request, [resolve, reject]) => Promise<unknown\>
>>__invoke resolve | reject to end pipeline__

>Response and Request are both unique for each PipeResponse

```ts
const [order, pipes: PipeRequest[]] = Api.request.use(order: number | PipeRequest, ...functions: PipeRequest[])
// Math.abs&trunc(order), if get NaN/Infinity, may causes bugs(will executed in the last place).
// Personal Recommendation: 0b1111
const bools = Api.request.eject([order, pipes])
// remove function(s) in specific order from pipeline, return true means success

const [order, pipes: PipeResponse[]] = Api.response.use(order: number | PipeResponse, ...functions: PipeResponse[])
const bools = Api.response.eject([order, pipes])
```

- ### `control`
___PipeRequest___
function return true or any message, someApi will immediate reject with that, don't forget to catch it.

___PipeResponse___
invoke resolve | reject to end pipeline

- ### body
__Failed to execute 'fetch' on 'Window': Request with ！GET/HEAD！ method cannot have body.__

[fetch.spec.whatwg.org](https://fetch.spec.whatwg.org/#request-class) constructor step-34

so body will be auto transformed by internal function to string, append to the search of URL (for type Object, FormData, URLSearchParams), or append to the pathname of URL (for type Array, String, Number).

other methods: Object and Array will be auto wrapped by JSON.stringfy()

- ## more
__read [docs](https://benno-wu.github.io/SimplifiedFetch/) or create an issue or a discussion.__

## runtime NodeJS

- ### FormData
when using FormData, please require this [@web-std/form-data](https://github.com/web-std/io/tree/main/form-data) and set FormData global.
Don't set this [form-data](https://github.com/form-data/form-data) global, and you can still use it local.

_Reason_: When body or params type FormData, internal core operation with __url__ needs Web API compatible FormData.

# Idea & Beta

- use/eject pipe once?
- formdata better support(application/x-www-form-urlencoded | multipart/form-data)
- fake mock? PipeRequest with resolve

---
Thanks to MDN, whatwg and Many blogers...
