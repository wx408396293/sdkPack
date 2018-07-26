# request详解（目前使用的是request2，request被废弃）

## 来源：https://github.com/xuliangzhan/xe-ajax

## 基于 Promise API 的请求函数，支持 Mock 虚拟服务

## 兼容性
基于 Promise 实现，低版本浏览器使用 promise.js 或 polyfill
支持 IE8+、Edge、Chrome、Firefox、Opera、Safari等...

## API:
### 提供常用便捷方法:
* all ( iterable )
* ajax ( options )
*
* get ( url, params, options )
* post ( url, body, options )
* put ( url, body, options )
* delete ( url, body, options )
* patch ( url, body, options )
*
* jsonp ( url, params, options )
* getJSON ( url, params, options )
* postJSON ( url, body, options )
* putJSON ( url, body, options )
* deleteJSON ( url, body, options )
* patchJSON ( url, body, options )

### 入参说明
* url（字符串） 请求地址，可被自定义 options 属性覆盖
* params/body（可选，对象/数组） 要发送的数据，可被自定义 options 属性覆盖
* options （可选，对象） 参数

### options 参数说明
| 参数 | 类型 | 描述 | 默认值 |
|------|------|-----|----|
| url | String | 请求地址 |  |
| baseURL | String | 基础路径 | 默认上下文路径 |
| method | String | 请求方法 | 默认GET |
| params | Object/Array | 请求参数 |  |
| body | Object/Array | 提交参数 |  |
| bodyType | String | 提交参数方式，如果要以表单方式提交改为FORM_DATA | 默认JSON_DATA |
| jsonp | String | 调用jsonp服务,属性名默认callback | 默认callback |
| async | Boolean | 是否异步 | 默认true(XEAjax虽然不做异步限制，但是建议必须异步) |
| credentials | String |  设置 cookie 是否随请求一起发送,可以设置: omit,same-origin,include | 默认same-origin |
| timeout | Number | 设置超时 |  |
| headers | Object | 请求头 | {Accept: 'application/json, text/plain, \*/\*;'} |
| transformParams | Function ( params, request ) | 用于改变URL参数 |  |
| paramsSerializer | Function ( params, request ) | 自定义URL序列化函数 |  |
| transformBody | Function ( body, request ) | 用于改变提交数据 |  |
| stringifyBody | Function ( body, request ) | 自定义转换提交数据的函数 |  |
| getXMLHttpRequest | Function ( request ) | 自定义 XMLHttpRequest 的函数 |  |

### Response 对象说明
| 属性 | 类型 | 描述 |
|------|------|-----|
| json | Function | 返回 Promise 对象，结果得到 json 数据,只能读取一次 |
| test | Function | 返回 Promise 对象，结果得到 text 数据,只能读取一次 |
| body | ReadableStream | 数据流 |
| bodyUsed | Boolean | 内容是否已被读取 |
| headers | Headers | 返回响应头 |
| status | Number | 返回状态码 |
| statusText | String | 状态 |
| url | String | 返回请求路径 |
| ok | Boolean | 根据状态判断完成还是失败 |
| redirected | Boolean | 是否重定向了 |
| type | String | 类型 |

## 全局参数设置
``` shell

// 示例
request.setup({
  baseURL: 'http://im.msxf.com',
  bodyType: 'FORM_DATA',
  credentials: 'include',
  headers: {
    'Accept': 'application/json, text/plain, \*/\*;'
  },
  transformParams (params, request) {
    // 用于在请求发送之前改变URL参数
    params.id = 123
    return params
  },
  paramsSerializer (params, request) {
    // 自定义URL序列化函数,最终拼接在url
    return 'id=123&name=2'
  }，
  transformBody (body, request) {
    // 用于在请求发送之前改变提交数据
    body.startTime = body.startDate.getTime()
    return body
  },
  stringifyBody (body, request) {
    // 自定义格式化数据函数,除了GET之外都支持提交数据
    return JSON.stringify(body)
  }
})
```

## 示例
### 调用，响应 response 对象
``` shell
let { get, post } = request;

// 获取文本
get('/api/user/list').then(response => {
  // response.ok 获取请求成功或失败
  response.text().then(text => {
    // 获取 text
  })
})

// 获取数据
post('/api/user/list').then(response => {
  response.json().then(data => {
    // 获取 data
  })
})

// 提交数据
post('/api/user/save', {name: 'test'})

// json 方式提交数据
post('/api/user/save', {name: 'test', password: '123456'}, {bodyType: 'JSON_DATA'})

// form 方式提交数据
post('/api/user/save', {name: 'test', password: '123456'}, {bodyType: 'FORM_DATA'})

// 查询参数和数据同时提交
post('/api/user/save', {name: 'test', password: '123456'}, {params: {id: 1}})
```
### 调用，响应 json 对象
``` shell
let { ajax, getJSON, postJSON, jsonp } = request;

// 参数调用
ajax({
  url: '/api/user/list',
  method: 'GET',
  params: {id: 1}
})

ajax({
  url: '/api/user/list',
  method: 'POST',
  body: {id: 1}
})

// 直接返回请求结果
getJSON('/api/user/list').then(data => {
  // 请求成功
}).catch(data => {
  // 请求失败
})

// 提交数据
postJSON('/api/user/save', {name: 'test'})

// json 方式提交数据
postJSON('/api/user/save', {name: 'test', password: '123456'}, {bodyType: 'JSON_DATA'})

// form 方式提交数据
postJSON('/api/user/save', {name: 'test', password: '123456'}, {bodyType: 'FORM_DATA'})

// 查询参数和数据同时提交
postJSON('/api/user/save', {name: 'test', password: '123456'}, {params: {id: 1}})
```
### jsonp 调用
``` shell
let { jsonp } = request;

jsonp('http://im.msxf.com/jsonp/user/message', {params: {id: 1}}).then(data => {
  // 请求成功
}).catch(data => {
  // 请求失败
})
```
### 并发多个请求
``` shell
let { all, get, getJSON } = request;

const allRequest = []
allRequest.push(get('/api/user/list'))
allRequest.push(getJSON('/api/user/message'), {id: 1})
Promise.all(allRequest).then(data => {
  // 所有异步完成之后执行
  // data 数组
}).catch(data => {
  // 某个异步请求失败时执行
  // data
})

// all 使用对象参数, 用法和 Promise.all 一致
const allRequest = []
allRequest.push({url: '/api/user/list', method: 'GET'})
allRequest.push({url: '/api/user/message', body: {id: 1}, method: 'POST'})
all(allRequest)
```

