<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [simplified-fetch](./simplified-fetch.md) &gt; [PipeResponse](./simplified-fetch.piperesponse.md)

## PipeResponse type

Asynchronous executed just after getting the response

<b>Signature:</b>

```typescript
export declare type PipeResponse = (response: Response, request: Request, controller: [(value: unknown) => void, (reason?: any) => void]) => Promise<unknown> | unknown;
```

## Remarks

invoke resolve \| reject to end pipeline

