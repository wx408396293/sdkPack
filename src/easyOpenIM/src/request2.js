'use strict';

/**
 * util headers fetchCont interceptor XEAjaxRequest XEAjaxResponse const index
 */

let isArray = Array.isArray || function (obj) {
    return obj ? obj.constructor === Array : false
}

function isFormData(obj) {
    return typeof FormData !== 'undefined' && obj instanceof FormData
}

function isCrossOrigin(request) {
    if (/(\w+:)\/{2}((.*?)\/|(.*)$)/.test(request.url)) {
        if (RegExp.$1 !== location.protocol || RegExp.$2.split('/')[0] !== location.host) {
            return true
        }
    }
    return false
}

function isObject(obj) {
    return obj && typeof obj === 'object'
}

function isFunction(obj) {
    return typeof obj === 'function'
}

function getLocatOrigin() {
    return location.origin || (location.protocol + '//' + location.host)
}

function getBaseURL() {
    let pathname = location.pathname
    let lastIndex = lastIndexOf(pathname, '/') + 1
    return getLocatOrigin() + (lastIndex === pathname.length ? pathname : pathname.substring(0, lastIndex))
}

function lastIndexOf(str, val) {
    if (isFunction(str.lastIndexOf)) {
        return str.lastIndexOf(val)
    } else {
        for (let len = str.length - 1; len >= 0; len--) {
            if (val === str[len]) {
                return len
            }
            ;
        }
    }
    return -1
}

function objectEach(obj, iteratee, context) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            iteratee.call(context, obj[key], key, obj)
        }
    }
}

function parseParam(resultVal, resultKey, isArr) {
    let result = []
    objectEach(resultVal, function (item, key) {
        if (isObject(item)) {
            result = result.concat(parseParam(item, resultKey + '[' + key + ']', isArray(item)))
        } else {
            result.push(encodeURIComponent(resultKey + '[' + (isArr ? '' : key) + ']') + '=' + encodeURIComponent(item))
        }
    })
    return result
}

// Serialize Body
function serialize(body) {
    let params = []
    objectEach(body, function (item, key) {
        if (item !== undefined) {
            if (isObject(item)) {
                params = params.concat(parseParam(item, key, isArray(item)))
            } else {
                params.push(encodeURIComponent(key) + '=' + encodeURIComponent(item))
            }
        }
    })
    return params.join('&').replace(/%20/g, '+')
}

let objectAssign = Object.assign || function (target) {
    for (let source, index = 1, len = arguments.length; index < len; index++) {
        source = arguments[index]
        for (let key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }
    return target
}

function arrayEach(array, callback, context) {
    if (array.forEach) {
        array.forEach(callback, context)
    } else {
        for (let index = 0, len = array.length || 0; index < len; index++) {
            callback.call(context || global, array[index], index, array)
        }
    }
}

function clearXEAjaxContext(request) {
    request.$context = request.$Promise = null
}

function toKey(key) {
    return String(key).toLowerCase()
}

function XEHeaders() {
    this._state = {}

    this.set = function (key, value) {
        this._state[toKey(key)] = [value]
    }

    this.get = function (key) {
        let _key = toKey(key)
        return this.has(_key) ? this._state[_key].join(', ') : null
    }

    this.append = function (key, value) {
        let _key = toKey(key)
        if (this.has(_key)) {
            return this._state[_key].push(value)
        } else {
            this.set(_key, value)
        }
    }

    this.has = function (key) {
        return !!this._state[toKey(key)]
    }

    this['delete'] = function (key) {
        delete this._state[toKey(key)]
    }
}

objectAssign(XEHeaders.prototype, {
    forEach: function (callback, context) {
        objectEach(this._state, function (value, key, state) {
            callback.call(context, value.join(', '), state)
        })
    }
})

let requestList = []

/**
 * 索引 XHR Request 是否存在
 * @param { XEAjaxRequest } item 对象
 */
function getIndex(item) {
    for (let index = 0, len = requestList.length; index < len; index++) {
        if (item === requestList[index][0]) {
            return index
        }
    }
}

/**
 * 将可取消的 XHR Request 放入队列
 *
 * @param { XEAjaxRequest } request 对象
 */
function setFetchRequest(request) {
    if (request.signal) {
        let index = getIndex(request.signal)
        if (index === undefined) {
            requestList.push([request.signal, [request]])
        } else {
            requestList[index][1].push(request)
        }
    }
}

function XEFetchSignal() {
}

function XEFetchController() {
    this.signal = new XEFetchSignal()
}

objectAssign(XEFetchController.prototype, {
    // 中止请求
    abort: function () {
        let index = getIndex(this.signal)
        if (index !== undefined) {
            arrayEach(requestList[index][1], function (request) {
                setTimeout(function () {
                    request.abort()
                })
            })
            requestList.splice(index, 1)
        }
    }
})

/**
 * 拦截器队列
 */
let state = {request: [], response: []};

function useInterceptors(calls) {
    return function (callback) {
        if (calls.indexOf(callback) === -1) {
            calls.push(callback)
        }
    }
}

function ResponseXHR(result) {
    try {
        let responseText = JSON.stringify(result.body)
    } catch (e) {
        let responseText = ''
    }
    this.status = result.status
    this.responseHeaders = result.headers
    this.response = responseText
    this.responseText = responseText
}

objectAssign(ResponseXHR.prototype, {
    getAllResponseHeaders: function () {
        let result = '';
        let responseHeader = this.responseHeaders;
        if (responseHeader) {
            for (let key in responseHeader) {
                if (responseHeader.hasOwnProperty(key)) {
                    result += key + ': ' + responseHeader[key] + '\n'
                }
            }
        }
        return result
    }
})

/**
 * Request 拦截器
 */
function requestInterceptor(request) {
    let XEPromise = request.$Promise
    let thenInterceptor = XEPromise.resolve(request, request.$context)
    arrayEach(state.request, function (callback) {
        thenInterceptor = thenInterceptor.then(function (req) {
            return new XEPromise(function (resolve) {
                callback(req, function () {
                    resolve(req)
                })
            }, request.$context)
        }).catch(function (req) {
            console.error(req)
        })
    })
    return thenInterceptor
}

/**
 * Response 拦截器
 */
function responseInterceptor(request, response) {
    let XEPromise = request.$Promise
    let thenInterceptor = XEPromise.resolve(response, request.$context)
    arrayEach(state.response, function (callback) {
        thenInterceptor = thenInterceptor.then(function (resp) {
            return new XEPromise(function (resolve) {
                callback(resp, function (result) {
                    if (result && result.constructor !== XEAjaxResponse) {
                        resolve(new XEAjaxResponse(request, new ResponseXHR(result)))
                    } else {
                        resolve(resp)
                    }
                })
            }, request.$context)
        }).catch(function (resp) {
            console.error(resp)
        })
    })
    return thenInterceptor
}

let interceptors = {
    request: {
        use: useInterceptors(state.request)
    },
    response: {
        use: useInterceptors(state.response)
    }
}

// 默认拦截器
interceptors.request.use(function (request, next) {
    if (!isFormData(request.method === 'GET' ? request.params : request.body)) {
        if (request.method !== 'GET' && String(request.bodyType).toLocaleUpperCase() === 'JSON_DATA') {
            request.setHeader('Content-Type', 'application/json; charset=utf-8')
        } else {
            request.setHeader('Content-Type', 'application/x-www-form-urlencoded')
        }
    }
    if (request.crossOrigin) {
        request.setHeader('X-Requested-With', 'XMLHttpRequest')
    }
    next()
})

function XEAjaxRequest(options) {
    objectAssign(this, {url: '', body: null, params: null, signal: null}, options)
    this.ABORT_RESPONSE = undefined
    this.method = String(this.method).toLocaleUpperCase()
    this.crossOrigin = isCrossOrigin(this)
    if (this.jsonp) {
        this.script = document.createElement('script')
    } else {
        this.xhr = isFunction(this.getXMLHttpRequest) ? this.getXMLHttpRequest(this) : new XMLHttpRequest()
    }
    setFetchRequest(this)
}

objectAssign(XEAjaxRequest.prototype, {
    abort: function (response) {
        this.xhr.abort(response)
    },
    setHeader: function (name, value) {
        this.headers[name] = value
    },
    getHeader: function () {
        return this.headers[name]
    },
    deleteHeader: function (name) {
        delete this.headers[name]
    },
    clearHeader: function () {
        this.headers = {}
    },
    getUrl: function () {
        let url = this.url
        let params = ''
        if (url) {
            if (isFunction(this.transformParams)) {
                // 避免空值报错，params 始终保持是对象
                this.params = this.transformParams(this.params || {}, this)
            }
            if (this.params && !isFormData(this.params)) {
                params = isFunction(this.paramsSerializer) ? this.paramsSerializer(this.params, this) : serialize(this.params)
            }
            if (params) {
                url += (url.indexOf('?') === -1 ? '?' : '&') + params
            }
            if (/\w+:\/{2}.*/.test(url)) {
                return url
            }
            if (url.indexOf('/') === 0) {
                return getLocatOrigin() + url
            }
            return this.baseURL.replace(/\/$/, '') + '/' + url
        }
        return url
    },
    getBody: function () {
        let request = this
        let XEPromise = request.$Promise
        return new XEPromise(function (resolve, reject) {
            let result = null
            if (request.body && request.method !== 'GET') {
                try {
                    if (isFunction(request.transformBody)) {
                        // 避免空值报错，body 始终保持是对象
                        request.body = request.transformBody(request.body || {}, request) || request.body
                    }
                    if (isFunction(request.stringifyBody)) {
                        result = request.stringifyBody(request.body, request) || null
                    } else {
                        if (isFormData(request.body)) {
                            result = request.body
                        } else if (String(request.bodyType).toLocaleUpperCase() === 'FORM_DATA') {
                            result = serialize(request.body)
                        } else {
                            result = JSON.stringify(request.body)
                        }
                    }
                } catch (e) {
                    console.error(e)
                }
            }
            resolve(result)
        }, request.$context)
    }
})

function XEReadableStream(xhr, request) {
    this.locked = false
    this._xhr = xhr
    this._request = request
}

objectAssign(XEReadableStream.prototype, {
    _getBody: function () {
        let that = this
        let xhr = this._xhr
        let request = this._request
        let XEPromise = request.$Promise
        return new XEPromise(function (resolve, reject) {
            let body = {responseText: '', response: xhr}
            if (xhr && xhr.response !== undefined && xhr.status !== undefined) {
                if (xhr.responseText) {
                    body.responseText = xhr.responseText
                    try {
                        body.response = JSON.parse(xhr.responseText)
                    } catch (e) {
                        body.response = null
                    }
                } else {
                    body.response = xhr.response
                    body.responseText = JSON.stringify(xhr.response)
                }
            } else {
                body.responseText = JSON.stringify(body.response)
            }
            if (that.locked) {
                reject(new TypeError('body stream already read'))
            } else {
                that.locked = true
                resolve(body)
            }
        }, request.$context)
    }
})

function XEAjaxResponse(request, xhr) {
    let that = this
    this.body = new XEReadableStream(xhr, request)
    this.bodyUsed = false
    this.url = request.url
    this.headers = new XEHeaders()
    this.status = 0
    this.statusText = ''
    this.ok = false
    this.redirected = false
    this.type = 'basic'

    this.json = function () {
        return this.body._getBody().then(function (body) {
            that.bodyUsed = true
            return body.response
        })
    }

    this.text = function () {
        return this.body._getBody().then(function (body) {
            that.bodyUsed = true
            return body.responseText
        })
    }

    // xhr handle
    if (xhr && xhr.response !== undefined && xhr.status !== undefined) {
        this.status = xhr.status
        this.redirected = this.status === 302
        this.ok = request.getPromiseStatus(this)

        // if no content
        if (this.status === 1223 || this.status === 204) {
            this.statusText = 'No Content'
        } else if (this.status === 304) {
            // if not modified
            this.statusText = 'Not Modified'
        } else {
            // statusText
            this.statusText = (xhr.statusText || this.statusText).trim()
        }

        // parse headers
        if (xhr.getAllResponseHeaders) {
            let allResponseHeaders = xhr.getAllResponseHeaders().trim()
            if (allResponseHeaders) {
                arrayEach(allResponseHeaders.split('\n'), function (row) {
                    let index = row.indexOf(':')
                    this.headers.set(row.slice(0, index).trim(), row.slice(index + 1).trim())
                }, this)
            }
        }
    }
}

let global = typeof window === 'undefined' ? this : window
let setupDefaults = {
    method: 'GET',
    baseURL: getBaseURL(),
    async: true,
    credentials: 'same-origin',
    bodyType: 'JSON_DATA',
    headers: {
        Accept: 'application/json, text/plain, */*;'
    },
    getPromiseStatus: function (response) {
        return response.status >= 200 && response.status < 300
    }
}

/**
 * XHR AJAX
 *
 * @param Object options 请求参数
 * @return Promise
 */
function request(options) {
    let opts = objectAssign({$Promise: Promise}, setupDefaults, {headers: objectAssign({}, setupDefaults.headers)}, options)
    let XEPromise = opts.$Promise
    return new XEPromise(function (resolve, reject) {
        return (opts.jsonp ? sendJSONP : sendXHR)(new XEAjaxRequest(opts), resolve, reject)
    }, opts.$context)
}

/**
 * 响应结束
 * @param { XEAjaxRequest } request 对象
 * @param { XHR } xhr 请求
 * @param { Promise.resolve } resolve 成功
 * @param { Promise.reject } reject 失败
 */
function sendEnd(request, xhr, resolve, reject) {
    responseInterceptor(request, new XEAjaxResponse(request, xhr)).then(function (response) {
        resolve(response)
    })
}

/**
 * XHR 请求处理
 * @param { XHR } xhr 请求
 * @param { Promise.resolve } resolve 成功 Promise
 * @param { Promise.reject } reject 失败 Promise
 */
function sendXHR(request, resolve, reject) {
    let xhr = request.xhr
    requestInterceptor(request).then(function () {
        xhr.open(request.method, request.getUrl(), request.async !== false)
        if (request.timeout && !isNaN(request.timeout)) {
            xhr.timeout = request.timeout
        }
        objectEach(request.headers, function (value, name) {
            xhr.setRequestHeader(name, value)
        })
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                sendEnd(request, xhr, resolve, reject)
            }
        }
        if (request.credentials === 'include') {
            xhr.withCredentials = true
        } else if (request.credentials === 'omit') {
            xhr.withCredentials = false
        }
        request.getBody().then(function (body) {
            xhr.send(body)
        }).catch(function () {
            xhr.send()
        })
    })
}

/**
 * jsonp 请求处理
 */
let jsonpIndex = 0

function sendJSONP(request, resolve, reject) {
    let script = request.script
    let url = request.getUrl()
    if (!request.jsonpCallback) {
        request.jsonpCallback = 'easyOpenIM' + (++jsonpIndex)
    }
    global[request.jsonpCallback] = function (response) {
        jsonpHandle(request, {status: 200, response: response}, resolve, reject)
    }
    script.type = 'text/javascript'
    script.src = url + (url.indexOf('?') === -1 ? '?' : '&') + request.jsonp + '=' + request.jsonpCallback
    script.onerror = function (evnt) {
        jsonpHandle(request, {status: 500, response: null}, resolve, reject)
    }
    if (isFunction(request.sendJSONP)) {
        request.sendJSONP(script, request, resolve, reject)
    } else {
        document.body.appendChild(script)
    }
}

/**
 * jsonp 请求结果处理
 * @param { XEAjaxRequest } request 对象
 * @param { XHR } xhr 请求
 * @param { resolve } resolve 成功 Promise
 * @param { reject } reject 失败 Promise
 */
function jsonpHandle(request, xhr, resolve, reject) {
    let response = new XEAjaxResponse(request, xhr)
    delete global[request.jsonpCallback]
    if (isFunction(request.sendEndJSONP)) {
        request.sendEndJSONP(request.script, request)
    } else {
        document.body.removeChild(request.script)
    }
    response.json().then(function (data) {
        (response.ok ? resolve : reject)(data)
    }).catch(function (data) {
        reject(data)
    })
}

/**
 * Request 对象
 *
 * @param String url 请求地址
 * @param String baseURL 基础路径，默认上下文路径
 * @param String method 请求方法(默认GET)
 * @param Object params 请求参数，序列化后会拼接在url
 * @param Object body 提交参数
 * @param String bodyType 提交参数方式(默认JSON_DATA) 支持[JSON_DATA:以json data方式提交数据] [FORM_DATA:以form data方式提交数据]
 * @param String jsonp 调用jsonp服务,回调属性默认callback
 * @param Boolean async 异步/同步(XEAjax虽然不做异步限制，但是建议必须异步)
 * @param String credentials 设置 cookie 是否随请求一起发送,可以设置: omit,same-origin,include(默认same-origin)
 * @param Number timeout 设置超时
 * @param Object headers 请求头
 * @param Function transformParams(params, request) 用于改变URL参数
 * @param Function paramsSerializer(params, request) 自定义URL序列化函数
 * @param Function transformBody(body, request) 用于改变提交数据
 * @param Function stringifyBody(body, request) 自定义转换提交数据的函数
 * @param Function getXMLHttpRequest() 自定义 XMLHttpRequest 的函数
 * @param Function getPromiseStatus(response) 自定义请求成功判断条件
 */
let setup = function setup(options) {
    objectAssign(setupDefaults, options)
}

function getOptions(method, def, options) {
    let opts = objectAssign({
        method: method,
        $context: request.$context,
        $Promise: request.$Promise || Promise
    }, def, options)
    clearXEAjaxContext(request)
    return opts
}

function responseResult(method) {
    return function () {
        return ajax(method.apply(this, arguments))
    }
}

// xhr response JSON
function responseJSON(method) {
    return function () {
        let opts = method.apply(this, arguments)
        let XEPromise = opts.$Promise
        return ajax(opts).then(function (response) {
            return new XEPromise(function (resolve, reject) {
                response.json().then(function (data) {
                    (response.ok ? resolve : reject)(data)
                }).catch(function (data) {
                    reject(data)
                })
            }, this)
        })
    }
}

// Http Request
let ajax = request;

// Http Request All
function doAll(iterable) {
    let XEPromise = request.$Promise || Promise
    let context = request.$context
    clearXEAjaxContext(request)
    return XEPromise.all(iterable.map(function (item) {
        if (item instanceof XEPromise) {
            return item
        } else if (item && isObject(item)) {
            return ajax(objectAssign({$context: context, $Promise: XEPromise}, item))
        }
        return item
    }), context)
}

// Http Request Method GET
function doGet(url, params, opts) {
    return getOptions('GET', isObject(url) ? {} : {url: url, params: params}, opts)
}

// Http Request Method POST
function doPost(url, body, opts) {
    return getOptions('POST', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method PUT
function doPut(url, body, opts) {
    return getOptions('PUT', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method PATCH
function doPatch(url, body, opts) {
    return getOptions('PATCH', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method DELETE
function doDelete(url, body, opts) {
    return getOptions('DELETE', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method jsonp
function jsonp(url, params, opts) {
    return request(getOptions('GET', {url: url, params: params, jsonp: 'callback'}, opts))
}

let get = responseResult(doGet);
let post = responseResult(doPost);
let put = responseResult(doPut);
let patch = responseResult(doPatch);
let delete2 = responseResult(doDelete);
let getJSON = responseJSON(doGet);
let postJSON = responseJSON(doPost);
let putJSON = responseJSON(doPut);
let patchJSON = responseJSON(doPatch);
let deleteJSON = responseJSON(doDelete);

let AjaxController = XEFetchController;
let version = '1.0.0';

let ajaxMethods = {
    all: doAll,
    ajax: ajax,
    get: get,
    getJSON: getJSON,
    post: post,
    postJSON: postJSON,
    put: put,
    putJSON: putJSON,
    patch: patch,
    patchJSON: patchJSON,
    delete: delete2,
    deleteJSON: deleteJSON,
    jsonp: jsonp,
    setup: setup,
    serialize: serialize,
    interceptors: interceptors,
    version: version,
};

/**
 * 混合函数
 *
 * @param {Object} methods 扩展
 */
function mixin(methods) {
    objectEach(methods, function (fn, name) {
        request[name] = isFunction(fn) ? function () {
            let result = fn.apply(request.$context, arguments)
            clearXEAjaxContext(request)
            return result
        } : fn
    })
}

/**
 * 安装插件
 */
function use(plugin) {
    plugin.install(request)
}

mixin(ajaxMethods);
request.use = use;
request.mixin = mixin;
request.AjaxController = AjaxController;

export default request;