# Simplified Fetch

通过封装一个统一的API请求对象，简化[fetch | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)的使用，并增强它！

[![NPM version](https://img.shields.io/npm/v/simplified-fetch?style=flat-square)](https://npmjs.org/package/simplified-fetch)
[![NPM downloads](https://img.shields.io/npm/dm/simplified-fetch?style=flat-square)](https://npmjs.org/package/simplified-fetch)

___支持 浏览器 和 node.js___

```bash
npm i simplified-fetch
```

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

如果你熟悉原生的fetch，这一配置只是用于最终读取response流，像response.json()

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
BaseConfig是原生fetch(resource [, init]) 第二个参数的扩展[fetch | MDN](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch)

配置项都列在Usage中，下方是默认配置。
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
urnParser基于模板字符串中的标签模板 Template strings or [Template literals | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
#### usage : _在格式化body前执行_

如果urn的类型是function，调用时传入params，返回值string用于构造url

如果urn的类型不是function，尝试对部分类型用[URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/toString)转化params并添加至URL的search部分(for type Object, FormData, URLSearchParams)，或者添加至URL的pathname部分(for type Array, String, Number).

```ts
// init
someApi:{
  urn: urnParser`/xxx/${0}/${1}`
}
// somewhere.js
Api.someApi(body, ['user',[1,2,3]], config)
// getUrl: /xxx/user/1,2,3
```
>urnParser中的各个占位符可以是任意的字符串，只要params可以通过[计算属性]访问即可，如果是Object类型，占位符需要长这样${'key'}。

- ### abort & timeout
[AbortController | MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)

```ts
const [constroller, signal] = Api.aborts.someApi
```
>当配置为数字时，代表超时毫秒数，数值可得于signal.timeout and (error: AbortError).timeout

- ## pipeline & control
* #### pipeline (Api.request / Api.response)
  * 管理多个有序的pipes函数，在请求前或者响应后遍历执行它们。
  * 不同order下的pipes基于 __递增的非负整数顺序__ 执行。
  * 同一order下的pipes基于 __添加时间先后顺序__ 执行，就像队列，先进先执行。
  * 实现基于特性[Ordinary OwnPropertyKeys](https://262.ecma-international.org/6.0/#sec-ordinary-object-internal-methods-and-internal-slots-ownpropertykeys)


* #### use/eject with order
  * use: @param ...pipe - pipe[0]即第一个参数应该为一个非负整数，其余为将遍历执行的pipes函数。如果第一个参数即order未指定，默认为0，代表将最先执行。
  * eject: @param pipe - 唯一的数组参数的第一位pipe[0]应该是代表order的非负整数，第二位即用于匹配删除的pipes数组。如果order未指定，将取最先执行的order值，通常来说是0。
  * order大小范围: +0 ≤ i < 2^32 - 1

* #### PipeRequest
__在发送请求之前，在内核处理url和config之后异步执行__
>function: (url: URL, config: BaseConfig, [body, params, dynamicConfig], [someApi, urn, config, baseConfig]) => unknown
>>__只有针对url和config的修改才会生效，__ 其他只是复制于创建配置和调用配置时的值或引用

>提醒:
>不要修改第二、三个数组参数内的参数

* #### PipeResponse
__获取Response后异步执行__
>function: (response: Response, request: Request, [resolve, reject]) => Promise<unknown\>
>>__invoke resolve | reject to end pipeline__

>Response和Request都是clone后传入每个PipeResponse

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
返回true或者任意的message(string)，someApi会立即reject，别忘了catch。

___PipeResponse___
调用 resolve | reject 结束pipeline

- ### body
__Failed to execute 'fetch' on 'Window': Request with ！GET/HEAD！ method cannot have body.__

[fetch.spec.whatwg.org](https://fetch.spec.whatwg.org/#request-class) constructor step-34

在上述情况下body会尝试对部分类型使用[URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/toString)转化为string，添加在URL的search部分(for type Object, FormData, URLSearchParams)，或者pathname部分(for type Array, String, Number).

其他method：Object和Array类型会自动包裹JSON.stringfy()

- #### methodInName
从api的名称或者APIConfig的key中得到method，你可以试试[这个](https://github.com/Benno-Wu/SimplifiedFetch/blob/alpha/test/browser/beforeV0.10.test.js#L6)

它只在init或者create的BaseConfig中生效，并且会被在APIConfig或者dynamicConfig中显式配置的值所替换。

- ## more
__读[docs](https://benno-wu.github.io/SimplifiedFetch/)或者开个issue或者discussion.__

## runtime NodeJS

- ### FormData
当使用FormData时，请使用这个包[@web-std/form-data](https://github.com/web-std/io/tree/main/form-data)，并设置FormData在global上。不要将此包[form-data](https://github.com/form-data/form-data)设置在global上，但你任然可以局部使用它。

_理由_: 当body或者params是FormData类型时，内核操作生成 __url__ 的操作需要兼容Web API的FormData。

# Idea & Beta

- use/eject pipe once?
- formdata better support(application/x-www-form-urlencoded | multipart/form-data)
- fake mock? PipeRequest with resolve
- urlFormatter?: (body|params, url) => URL
- OpenAPI

---
Thanks to MDN, whatwg and Many blogers...
