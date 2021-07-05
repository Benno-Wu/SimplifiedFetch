### 0.4.0
#### ⚠ _notice_: big change, read bofore update.
- pipeRequest is async now
- support dynamic config when invoke Api.someApi(body, param, config)
- fix wrong design of param on pipeline.use
- publish iife
- much better typed
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

knowns bugs
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

knowns bugs
* pipeline

### 0.0.3
- first vision
- base test passed

known bugs
* abort & timeout