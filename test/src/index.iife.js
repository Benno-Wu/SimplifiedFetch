var test=function(e){"use strict";const t=Function.prototype.call.bind(Object.prototype.toString),o=Object.fromEntries(["Object","Number","String","Array","URLSearchParam","FormData"].map((e=>[e,`[object ${e}]`])));class n{static init(e,t){(function(){if("object"==typeof globalThis&&globalThis)return globalThis;if("object"==typeof window&&window)return window;if("object"==typeof self&&self)return self;if("object"==typeof global&&global)return global;throw new Error("unable to get globalThis, try 'import 'simplified-fetch/polyfill/globalThis'' before init")}())[(null==e?void 0:e.newName)||"Api"]=new r(t,a(n.baseConfig,e))}static create(e,t){return new r(t,a(n.baseConfig,e))}}n.baseConfig={method:"GET",bodyMixin:"json",headers:{"Content-Type":"application/json"},enableAbort:!1,pureResponse:!1};class r{constructor(e,t){this.aborts={},this.request=new s,this.response=new s;for(const[o,n]of Object.entries(e)){let e,r={};"string"==typeof n||"function"==typeof n?e=n:({urn:e,config:r={}}=n);const s=a(t,r);let u,f,p=null==s?void 0:s.enableAbort;p&&(u=new AbortController,f=u.signal,s.signal=f,this.aborts[o]=[u,f]),this[o]=async(n,b,h={})=>{var d;let g=!1;const m=a(s,h),y=c(e,m,b);y.pathname+=null!==(d=null==m?void 0:m.suffix)&&void 0!==d?d:"";const v=n?l(y,m,n):y;for(const[s,i]of this.request.pipeMap)g||"function"!=typeof i||(g=await i(v,m,[n,b],[o,e,r,t]));return new Promise(((e,t)=>{if(g)return void t(g);const o=t=>{g=!0,e(t)},n=e=>{g=!0,t(e)};"number"==typeof p&&(f.timeout=p,setTimeout((()=>u.abort()),p));const r=new Request(v.toString(),m);fetch(r).then((async s=>{for(const[e,t]of this.response.pipeMap)if("function"==typeof t&&await t(s.clone(),r,[o,n]),g)return;i([e,t],s,null==m?void 0:m.bodyMixin,null==m?void 0:m.pureResponse)})).catch((e=>{"AbortError"===e.name&&"number"==typeof p&&(e.timeout=p),t(e)}))}))}}}}class s{constructor(){this.pipeMap=new Map,this.use=(...e)=>{const t=[];return e.forEach((e=>{const o=Math.random().toString(16).slice(-3);this.pipeMap.set(o,e),t.push(o)})),1===t.length?t[0]:t},this.eject=e=>{const t=(new Array).concat(e),o=[];return t.forEach((e=>{o.push(this.pipeMap.delete(e))})),1===o.length?o[0]:o}}}function i([e,t],o,n="json",r=!1){const s=r?o.clone():void 0;o[n]().then((t=>e(r?[t,s]:t)))}function a(e,n){const r=Object.assign({},null==e?void 0:e.headers,null==n?void 0:n.headers);return t(null==e?void 0:e.custom)===o.Object||t(null==n?void 0:n.custom)===o.Object?{...e,...n,headers:r,custom:Object.assign({},null==e?void 0:e.custom,null==n?void 0:n.custom)}:{...e,...n,headers:r}}function c(e,t,o){var n;return new URL("function"==typeof e?e(o):e,null!==(n=null==t?void 0:t.baseURL)&&void 0!==n?n:"")}function l(e,n,r){const s=t(r);if(["GET","HEAD"].includes(n.method.toUpperCase())){const t=e.search.includes("?");switch(e.search+=t&&"&"!==e.search.slice(-1)[0]?"&":"",s){case o.Object:case o.FormData:e.search+=new URLSearchParams(r).toString();break;case o.URLSearchParams:e.search+=r.toString();break;case o.Array:case o.String:case o.Number:e.pathname+=`/${r.toString()}`}}else(s===o.Object||Array.isArray(r))&&(r=JSON.stringify(r)),n.body=r;return e}return e.default=n,e.urnParser=(e,...t)=>o=>e.reduce(((e,n,r)=>{var s;return e+n+(null!==(s=null==o?void 0:o[t[r]])&&void 0!==s?s:"")}),""),Object.defineProperty(e,"__esModule",{value:!0}),e}({});
