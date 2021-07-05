# Simplified Fetch

Encapsulate a unified API request object to simplify the use of [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) and enhance it!

> npm i simplified-fetch

__If you like this repository, share it!__

## Usage

```ts
import API, { urnParser } from 'simplified-fetch'

// generate 'Api' on globalThis/window/global(nodejs)
API.init({
    newName?: string, // default:'Api', just for global access
    baseURL?: string | URL,
    method?: Methods, // default:'GET', 'POST', 'PUT'...
    bodyMixin?: BodyMixin, // default:'json', 'text', 'blob', 'formData', 'arrayBuffer'
    enableAbort?: boolean | number, // abort & timeout
    pureResponse?: boolean, // default:false, whether resolved with Response.clone()
    // format: [response, pureResponse] or response
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

### Examples

```js
// have a quick look at *.test.js

// todo ts examples
```

## Config & Ability

- ### default config & BaseConfig extends [RequestInit](https://fetch.spec.whatwg.org/#requestinit)
BaseConfig is just an extension of second param of fetch(resource [, init]) [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch)

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
urnParser is based on Template literals (Template strings) [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
#### usage :
if typeof urn is function, then invike it with params, and build url with returned string
```js
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
const keys = Api.request.use(...function)

__Asynchronous executed just before fetch and after internal core operation with url & config__
>function: (url: URL, config: BaseConfig, [body, params], [someApi, urn, config, baseConfig]) => unknown
>>__only the change to url & config will effect,__ others are just copy from your init/create config & call params

const bools = Api.request.eject(key(s))
>remove function(s) from request pipeline, return true means success

const keys = Api.response.use(...function)

__Asynchronous executed just after get Response__
>function: (response: Response, request: Request, [resolve, reject]) => Promise<unknown\>
>>__invoke resolve | reject to end pipeline__

const bools = Api.response.eject(key(s))
>remove specific function from response pipeline, return true means success

- ### `control`
___request___
function return true or any message, someApi will immediate reject with that, don't forget to catch it.

___response___
invoke resolve | reject to end pipeline

- ### body
__Failed to execute 'fetch' on 'Window': Request with ！GET/HEAD！ method cannot have body.__

so body will be auto transformed by internal function to string, append to the search of URL (for type Object, FormData, URLSearchParams), or append to the pathname of URL (for type Array, String, Number).

other methods: Object and Array will be auto wrapped by JSON.stringfy()


- ## more
__read [docs](https://benno-wu.github.io/SimplifiedFetch/) or create an issue or a discussion, feel free to pr on docs.__

### _you may looking for shorthand of specific method_

where is the xxx.get/post/put...?
__do something like below__
```ts
API.init({...},{
    post:{
        urn:url=>url,
        config:{
            method:'POST',
            ...
        }
    }
})
// somewhere.js
Api.post(body, url, config)
```

# Idea & Beta

- globalThis
- runtime nodejs
- params one more usage
- use/eject pipe with order

---
Thanks to MDN, whatwg and Many blogers.
