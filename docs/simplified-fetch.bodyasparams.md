<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [simplified-fetch](./simplified-fetch.md) &gt; [bodyAsParams](./simplified-fetch.bodyasparams.md)

## bodyAsParams type

body of fetch

<b>Signature:</b>

```typescript
export declare type bodyAsParams = string | Record<string, unknown> | Array<unknown> | BodyInit;
```

## Remarks

when method is 'GET'\|'HEAD', try parse to string mainly by URLSearchParam [MDN](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

