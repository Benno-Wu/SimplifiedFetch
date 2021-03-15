/**
 * polyfill for globalThis
 * @remarks issue: frames
 * 
 * ref: {@link https://mathiasbynens.be/notes/globalthis}
 * @beta
 */
// @ts-nocheck
var _: any;

// @ts-nocheck
(function () {
    try {
        // Object.prototype.__defineGetter__('SimplifiedFetch', function () { return this })
        // for ie
        Object.defineProperty(Object.prototype, 'SimplifiedFetch', { get: function () { return this }, configurable: true })
        SimplifiedFetch.globalThis = SimplifiedFetch
        // ie 10+
        if (typeof globalThis === 'undefined') {
            window.globalThis = window;
        }
        delete Object.prototype.SimplifiedFetch
        // ie 8
    } catch (e) { window.globalThis = window }
})()

export default _
