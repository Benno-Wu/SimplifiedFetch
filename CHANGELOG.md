### 0.6.0
#### ⚠ _notice_: big change, read bofore update.
- runtime nodejs
- add polyfill: abort-controller, isomorphic-fetch
- delete awesome globalThis polyfill by Mathias Bynens
- better typed

### 0.5.0
#### ⚠ _notice_: big change, read bofore update.
- use/eject pipes with order
- params one more usage
- dynamicConfig is accessible on pipeRequest
- add ts example
- better typed
- add eslint

### 0.4.1
**bug fix**
- body type URLSearchParams

### 0.4.0
#### ⚠ _notice_: big change, read bofore update.
- pipeRequest is async now
- support dynamic config when invoke Api.someApi(body, param, config)
- fix wrong design of param on pipeline.use
- publish iife
- much better typed
- add corejs@3
- uglify->terser, causes bug on pipeline, when test with iife.

### 0.2.0
#### ⚠ _notice_: apiF big change, read bofore update.
- add custom on BaseConfig for custom config
- add APIConfig support: someApi: string
- better typed

### 0.1.0
#### ⚠ _notice_: big change, read bofore update.
- add use/eject with array
- test passed: suffix

### 0.0.12
- better type support

### 0.0.11
- better type support

### 0.0.10
- fix polyfill export

### 0.0.9
- fix export error & forget to generate the type

known bugs
- wrong polyfill export, it always runs even if you don't import it.

### 0.0.8
- add output esm.js

now support umd & esm

### 0.0.7
- new control of pipeline
- pipeline test passed

new ideas
- use/eject with array

### 0.0.6
_notice:_ pipeline will be fixed soon and come with new design of control
- test passed: abort, pureResponse

new ideas
- design of pipe control

known bugs
* pipeline

### 0.0.3
- first vision
- base test passed

known bugs
* abort & timeout