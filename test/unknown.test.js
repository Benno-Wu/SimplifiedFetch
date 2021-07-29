describe('After polyfill, Unknown test', () => {
    test.todo(`
    consider using core-js@3 as polyfill
    https://github.com/zloirock/core-js/blob/b2d25b7ade9f86a613d9cabf1d8dac0b90c907f7/packages/core-js/modules/web.url-search-params.js#L317
    this issue mentioned the default behavior breaks by polyfill, so in that situation, they fix it.
    but here, we got defaultConfig which set header's content-type always is 'application/json', fix needed.(maybe not?)
    And there might be some default behavior we don't know, or some api breaks we didn't test.
    `)
})