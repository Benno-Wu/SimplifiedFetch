// https://mathiasbynens.be/notes/globalthis
// @ts-nocheck
export var globalThis = globalThis ?? window ?? self ?? global ?? (function () {
    // Object.prototype.__defineGetter__('simplifiedFetch', function () { return this })
    // for ie
    Object.defineProperty(Object.prototype, 'simplifiedFetch', { get: function () { return this }, configurable: true })
    simplifiedFetch.globalThis = simplifiedFetch
    delete Object.prototype.simplifiedFetch
    return globalThis
})()
// issue: frames
