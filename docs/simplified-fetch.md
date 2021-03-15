<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [simplified-fetch](./simplified-fetch.md)

## simplified-fetch package

Encapsulate a unified API request object to simplify the use of fetch

## Remarks

docs generated by @<!-- -->microsoft<!-- -->/<!-- -->api-extractor &amp; api-documenter, may not so good.

## Classes

|  Class | Description |
|  --- | --- |
|  [API](./simplified-fetch.api.md) | main entry to generate the SimplifiedFetch |

## Interfaces

|  Interface | Description |
|  --- | --- |
|  [APIConfig](./simplified-fetch.apiconfig.md) | config of each api |
|  [BaseConfig](./simplified-fetch.baseconfig.md) | basic config |
|  [iApi](./simplified-fetch.iapi.md) | <b><i>(BETA)</i></b> pipe Map<function> which operate Request &amp; Response [PipeRequest](./simplified-fetch.piperequest.md) [PipeResponse](./simplified-fetch.piperesponse.md) |
|  [iPipe](./simplified-fetch.ipipe.md) | manage the functions which pipe the request or response |

## Variables

|  Variable | Description |
|  --- | --- |
|  [urnParser](./simplified-fetch.urnparser.md) | parse the template strings with params |

## Type Aliases

|  Type Alias | Description |
|  --- | --- |
|  [apiF](./simplified-fetch.apif.md) | the access of configed fetch |
|  [bodyAsParams](./simplified-fetch.bodyasparams.md) | body of fetch |
|  [BodyMixin](./simplified-fetch.bodymixin.md) | transform the response body |
|  [Methods](./simplified-fetch.methods.md) | Http request methods |
|  [PipeRequest](./simplified-fetch.piperequest.md) | Synchronous executed after internal core operation with url &amp; config, just before fetch |
|  [PipeResponse](./simplified-fetch.piperesponse.md) | Asynchronous executed just after getting the response |
|  [PipeUnion](./simplified-fetch.pipeunion.md) |  |
|  [URN](./simplified-fetch.urn.md) | rest part of the fetch url |
|  [URNParser](./simplified-fetch.urnparser.md) | function which parser the urn with prarms |
