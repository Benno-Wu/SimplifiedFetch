// todo type-challenge
export const toString = Function.prototype.call.bind(Object.prototype.toString)
export const hasOwnProperty = Function.prototype.call.bind(Object.prototype.hasOwnProperty)

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

// https://stackoverflow.com/questions/46176165/ways-to-get-string-literal-type-of-array-values-without-enum-overhead
// type _types = 'Object' | 'Number' | 'String' | 'Array' | 'URLSearchParams' | 'FormData'
// const tuple = <T extends Array<string>>(...args: T) => args
// const types = tuple('Object', 'Number', 'String', 'Array', 'URLSearchParams', 'FormData')
const typeTuple = ['Object', 'Number', 'String', 'Array', 'URLSearchParams', 'FormData'] as const
type typeString = typeof typeTuple[number]
// todo type-challenge
type perfixObject<types extends string> = Record<types, `[object ${types}]`>
// Typescript — How to Object.fromEntries tuples
// https://dev.to/svehla/typescript-object-fromentries-389c
// export const objects = Object.fromEntries(typeTuple.map<[typeString, `[object ${typeString}]`]>(v => [v, `[object ${v}]`]))
export const objects = Object.fromEntries<`[object ${typeString}]`>(typeTuple.map(v => [v, `[object ${v}]`])) as perfixObject<typeString>

export const object2String = <str extends string>(type: str) => `[object ${type}]` as const

// todo test on benchmark/jsperf ?

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
