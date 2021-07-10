export const toString = Function.prototype.call.bind(Object.prototype.toString)

// export const objects: any = Proxy ? new Proxy({}, {
//     get: function (obj, prop: string) {
//         return `[object ${prop}]`
//     }
// }) : {
//     object: '[object Object]',
//     number: '[object Number]',
//     string: '[object String]',
//     array: '[object Array]',
//     urlSearchParams: '[object URLSearchParams]',
//     formData: '[object FormData]',
// }

export const objects = Object.fromEntries(
    ['Object', 'Number', 'String', 'Array', 'URLSearchParams', 'FormData']
        .map(v => [v, `[object ${v}]`]))

export const object2String = (type: string) => `[object ${type}]`

// 性能测试一哈,func和proxy的Heap很高, obj最爽快
// console.log('func test start')
// const object2String = (type) => `[object ${type}]`
// let _ = Array(1000000), test = ['Object', 'Number', 'String', 'Array', 'URLSearchParam', 'FormData'];
// let a1 = performance.now()
// for (let i = 0; i < _.length; i++) {
//     _[i] = object2String(test[parseInt(Math.random() * 6 + '')])
// }
// console.log(performance.now() - a1, 'func test end');

// console.log('proxy test start')
// let _ = Array(1000000), test = ['Object', 'Number', 'String', 'Array', 'URLSearchParam', 'FormData'];
// const objects = new Proxy({}, { get: function (obj, prop) { return `[object ${prop}]` } })
// let a1 = performance.now()
// for (let i = 0; i < _.length; i++) {
//     _[i] = objects[test[parseInt(Math.random() * 6 + '')]]
// }
// console.log(performance.now() - a1, 'proxy test end');

// console.log('object test start')
// let _ = Array(1000000), test = ['Object', 'Number', 'String', 'Array', 'URLSearchParam', 'FormData'];
// const objects = {
//     Object: '[object Object]',
//     Number: '[object Number]',
//     String: '[object String]',
//     Array: '[object Array]',
//     URLSearchParams: '[object URLSearchParams]',
//     FormData: '[object FormData]',
// }
// let a1 = performance.now()
// for (let i = 0; i < _.length; i++) {
//     _[i] = objects[test[parseInt(Math.random() * 6 + '')]]
// }
// console.log(performance.now() - a1, 'object test end');
