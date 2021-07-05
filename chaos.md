```javascript
// index.ts
import API from 'xxx'

API.init({
  defaultMethod:'get'||'post'||''
  defaultParser:'json'||'formData'||''||function:Promise<any>{}
  baseURL:''
},{
  name:{config:RequestInit,urn:string||function():string{}}
})

const {xxx,...yourSchema}=await Api.name(param)
// 超时自动abort
// 错误返回不稳定！https://developer.mozilla.org/en-US/docs/Web/API/AbortController
const [constroller,signal (implements EventTarget)]=Api.aborts[name]
// 超时设置的时间在signal和catch的error['timeout']
// 所以可以在catch或者signal.onabort中处理


// done
const aaa=API.create({

},{
  name:{
    urn:''|function():string{},
  }
})
const {xxx, ...yourSchema}=await aaa.name(param)

// other.ts
// like fetch, no need to import
await Api.name()


// proxy?
// 功能点详细阐述：某个后端动态决定的路由地址，某请求后重复使用
// for temp url from server
await Api.push()
// up is wrong, after that call, you mean it will be saved to reuse, and user won't feel any change, but why not try proxy to dynamic push/add a property return this func
await Api.name()
// 好像可以通过下面这个很好的解决
比如:
{
  any:{
    urn:p=>p,
    {...config}
  }
}
then
Api.any(body:any,'url')


// done
最初是想作动态路径，即/${a}/${b}，await Api.xxx(body,params:[a,b])
这个时候就有第一个参数可能手写个undefined|null给它
因为是一个函数，经常传obj自动转json，所以不考虑整合参数再拆
动态url: https://es6.ruanyifeng.com/#docs/string#标签模板
上述解法意外支持这类url：/user/1,2,3，只需要params:['user',[1,2,3]]
升级为任意函数？本质上可以用户自定义，只要这个函数按规范处理参数和返回就行
主要考虑处理.../${a}/${b}?${c}=${d}&${e}=${f}...
目前能很好处理动态路由，但是后面的参数还不行，数量动态能力不够，可以是可以就是别扭，很多[x,x,x,'','','']多余
由下面解决
get:自己拼？obj自动转化？url长度限制！
Failed to execute 'fetch' on 'Window': Request with ！GET/HEAD！ method cannot have body.
自动整合query参数，或者说处理url，主要使用原生api(URL,UrlSearchParams)，支持各种组合，包括但不限于：相对路径(../,//xxx),绝对路径，直接写死的参数
更多参考：(只放了一个，spec相关自己查吧)https://www.zhangxinxu.com/wordpress/2019/08/js-url-urlsearchparams/

// done
参数默认传到body

suffix & prefix
prefix在这里可能又用户自定义函数生成配置对象传入更合适，suffix同理，但是suffix的频繁变动要么很少就是个习惯.do，.json等，要么很频繁，而非prefix这类一般用来表述api版本等场景，可数，可控。

why: 不提供errorhandler？不论何种http状态，都需要转化body返回
因为https://www.cnblogs.com/libin-1/p/6853677.html 400 bad request
服务器报错，可以是返回简单的状态码，前端选择reject(code)，再catch内Toast等提示一个简单的‘网络异常’或者根据code提示不同的信息。
但是后者的信息和code的关联，实际上在后端拦截器内早有通用的处理方案，错误原因五花八门，后端不会在每个service中写各种错误文案的，而是选择返回一个代码，再由拦截器处理代码，附加各种文案，或者i18n等国际化操作返回。所以前端提示的文案，如果前端再转码，非常多余，除非有文案修改操作，但这一般是设计问题。
那怎么办？后端只要响应了，不论什么结果(即http状态与实际信息轻关联，因为常有200但是‘网络异常’)，前后端都应该沟通约定一个通用的格式schema，比如极简化：{success:bool,data:{},message:string}，success分叉两种处理，成功就拿data内的json(常规)处理，失败就拿message做个提示，再压缩就是放在一个字段里，两种格式转化。或者常规：{code,message,result}等等
为什么说http的状态码不够用，因为最常见的400，参数错误啥的，过于笼统。后端当然可以选择处理成一个message放在body里，但是成功呢？必定是一段数据放在body里。两个格式不统一，会导致前端代码时刻出现两种解析、解构方案，更有甚者，直接在api的统一处理中加入Toast等界面元素处理非2xx状态码。api处理整合就应该只管整合输出这事，界面元素就应该在会请求接口并控制元素展示的ViewModel中处理。
所以不管什么状态码，真正的业务信息是在body里，统一解析就好了，至于浏览器对3xx状态码的操作，js控制或者随它去吧。

// no need
xxx[method]()

Goal:
simplified是哪simplify了？
熟知原生相关对象
配置默认method
配置url，config，调name使用


// done
// interceptors:[]/{} // 还是叫pipe吧，两头各有一串
// necessary?
// middleware:[] //中间件，一次性串两个

// 多串行管道如何控制其跳过，插入执行？
// 由用户use+eject自行控制，bad:用户控制复杂度疯涨，多处公用pipe，要炸
// 新增配置项？用户配置心累，Api这里要炸
// 这个问题某种意义上说，通过给用户提供未封装的'proxy那块功能'，由它自己导入引用公用func，请求前调用即可。
// 不对，proxy包装的Api是内嵌pipe的。那咋办呢？


// unnecessary
// charset？发送的由浏览器和用户设置
// 接收的转码？不合适，因为转码需求可能是某个字段，不一定是整个response
// cache

// no need
实时设置(全局)(实例)默认配置？
从实现方式class static 的方式看，用户可以自己调随时改，但是生成的Api对象能不能获取就得看情况开发一下。目前是不行，因为copy出新对象了。

to use:
object.freeze/seal
??= &&= ||= 逻辑赋值表达式
browser globalThis window=self
拦截器的实现，func操作数组，执行前顺序调用，或者proxy+defineProperty代理window/globalThis对象,不过太大了，不如单抽，放在另一个对象里。或者Service Worker拦截
URLSearchParams 处理url query部分的原生接口
URL.createObjectURL
FormDate(),JSON,


// About axios
axios is heavily inspired by the $http service provided in Angular. Ultimately axios is an effort to provide a standalone $http-like service for use outside of Angular.
axios({}):big obj, config{method,url,data,header...}
axios.request(config)
axios.get(url[, config])
axios.delete(url[, config])
axios.head(url[, config])
axios.options(url[, config])
axios.post(url[, data[, config]])
axios.put(url[, data[, config]])
axios.patch(url[, data[, config]])

// 返回新实例
axios#=axios.create([config])注入默认基础配置到新实例

axios#request(config)
axios#get(url[, config])
axios#delete(url[, config])
axios#head(url[, config])
axios#options(url[, config])
axios#post(url[, data[, config]])
axios#put(url[, data[, config]])
axios#patch(url[, data[, config]])
axios#getUri([config]):不请求，但是整合config返回请求url，可以用来看整合的get，再发送？

多实例各自配置
核心：同时支持Browser、Node
支持拦截器预处理req、res,可单独配置何时使用，异步还是同步处理，支持动态插入删除
基础url+api路径微整合
req、res两头参数默认JSON处理，也有application/x-www-form-urlencoded，常用注意！
路径参数obj传入，可自定义func作toString转化，参考qs，jQuery
body同上，但是类型丰富些，字节流等等，还有k=v?k=v类型的赋值？
支持超时，进度条，代理
http长度限制
promise状态区分点，传func，判断http.status
其他头快捷设置？

同时预设置了返回的JSON格式schema，有点杂+http，东西全，包括了，response、request相关

相对于配置生成新实例，也有axios.defaults.xxx，这类配置全局默认
```
