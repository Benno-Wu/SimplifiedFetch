/**
 * polyfill for globalThis
 * @remarks issue: frames
 * 
 * ref: {@link https://mathiasbynens.be/notes/globalthis}
 * @beta
 */
// @ts-nocheck
// bug todo, not right. 为了整合，所以有return，这里可能导致编译的代码出现两个globalThis，太多不知道
// 虽然这段代码跑起来没问题
// todo polyfill 拆分, just import 'xxx/polyfill'
export var globalThis: any = window ?? self ?? global ?? (function () {
    // Object.prototype.__defineGetter__('simplifiedFetch', function () { return this })
    // for ie
    Object.defineProperty(Object.prototype, 'simplifiedFetch', { get: function () { return this }, configurable: true })
    simplifiedFetch.globalThis = simplifiedFetch
    // simplifiedFetch['globalThis'] = simplifiedFetch
    delete Object.prototype.simplifiedFetch
    return globalThis
})()

// export default globalThis


// todo
// <script>
// // https://mathiasbynens.be/notes/globalthis

// // The polyfill starts here.
// (function() {
// 		Object.defineProperty(Object.prototype, '__magic__', {
// 			get: function() {
// 				return this;
// 			},
// 			configurable: true
// 		});
// 		__magic__.globalThis = __magic__;
// 		// The previous line should have made `globalThis` globally
// 		// available, but it fails in Internet Explorer 10 and older.
// 		// Detect this failure and fall back.
// 		if (typeof globalThis === 'undefined') {
// 			// Assume `window` exists.
// 			window.globalThis = window;
// 		}
// 		delete Object.prototype.__magic__;
// 	} catch (error) {
// 		// In IE8, Object.defineProperty only works on DOM objects.
// 		// If we hit this code path, assume `window` exists.
// 		window.globalThis = window;
// 	}
// }());
// // The polyfill ends here.

// // Your code can use `globalThis` now.
// function log(value) {
// 	if (typeof document === 'object') {
// 		document.getElementById('output').innerHTML += value + '<br>';
// 	} else if (typeof console === 'object') {
// 		console.log(value);
// 	} else {
// 		print(value);
// 	}
// }
// log('Testing the polyfill in a ' + (this ? 'classic script' : 'module'));
// log(String(globalThis));

// </script>
