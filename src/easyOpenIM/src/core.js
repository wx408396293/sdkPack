'use strict';

import {
    uuid,
    addEvent,
    loadImage,
    createLink,
    stringfyQueryString,
} from '../utils';
import drag from './drag'
import Browser from './browser'
import request from './request2'

// 客服端log打印
const LOG = (text, type = 'log') => {
    window.console[type](`easyOpenIM 打印信息：${text}`);
};

// 图标Icon
let ballIcon = 'data:image/png;base64,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';
// 机器人头像
let robotPortrait = 'data:image/png;base64,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';
// 颜色设置
let colors = ' easyOpenIM-color-blue';

let bs = new Browser(),
    width = document.documentElement.clientWidth || document.body.clientWidth,
    height = document.documentElement.clientHeight || document.body.clientHeight;

export class EasyOpenIM {
    constructor(config) {
        if (!config) {
            config = {
                frame: {
                    layer: {},
                },
            };
        }
        if (!config.frame) {
            config.frame = {
                layer: {},
            };
        }
        if (!config.toolbar) {
            config.toolbar = {};
        }
        if (!config.frame.layer) {
            config.frame.layer = {};
        }
        this.init(config);
    }

    // 初始化配置
    init(config) {

        const {origin} = window.location;

        // frame ID
        this.id = `easyOpenIM-${uuid()}`;
        // frame layer ID
        this.layerId = `easyOpenIM-layer-${uuid()}`;
        // toolbar ID
        this.toolbarId = `easyOpenIM-toolbar-${uuid()}`;
        // 是否支持拖拽
        this.drag = config.drag || false;
        // 是否是线上，如果是，就使用.min压缩文件
        this.online = config.online || false;
        // 页面名称
        this.page = config.page || 'vChat';
        // 设置引入css的文件名称
        this.cssName = config.cssName || 'easyOpenIM';
        // 引入的服务器地址
        this.root = config.root || origin;
        // 引入的css的文件地址
        this.cssURL = config.cssURL || `/library/${this.cssName}/${this.cssName}${this.online ? '.min' : ''}.css`;
        // 外部资源依赖
        this.resource = config.resource || false;
        // 框架配置
        this.frame = {
            // title name
            title: config.frame.title || '',
            // 框架 style width
            width: config.frame.width || '360px',
            // 框架 style height
            height: config.frame.height || '550px',
            // 框架 style right
            right: config.frame.right || '10px',
            // 框架 style bottom
            bottom: config.frame.bottom || '10px',
            // 框架 style margin
            margin: config.frame.margin || '0 0 0 0',
            // 框架 style z-index
            zIndex: config.frame.zIndex || '9999999',
            // 框架 layer 遮罩层配置
            layer: {
                // 是否需要开启遮罩层
                show: config.frame.layer.show || false,
                // 遮罩层背景色
                baColor: config.frame.layer.baColor || 'rgba(0,0,0,.3)',
            },
        };
        // 工具栏配置
        this.toolbar = {
            children: [
                {
                    label: '开启/隐藏IM',
                    callback: 'start',
                    baColor: '#2db7f5',
                },
                // {
                //     label: '关闭IM',
                //     callback: 'remove',
                //     baColor: '#f90',
                // },
                // {
                //     label: '重置IM',
                //     callback: 'restart',
                //     baColor: '#ed3f14',
                // },
            ],
            // 工具栏请求参数
            query: config.toolbar.query || {},
            // 是否需要开启工具栏，默认开启
            append: config.toolbar.append || false,
            // 工具栏 style right
            right: config.toolbar.right || '10px',
            // 工具栏 style bottom
            bottom: config.toolbar.bottom || '10px',
            // 工具栏 style margin
            margin: config.toolbar.margin || '0 0 0 0',
        };
        // 服务器请求方法，类似于jq的ajax
        this.request = request;
        // baseConfig
        this.baseConfig = {};
        // 内部使用API接口集合
        this._api = {
            // Http Response Code
            'code': {
                OK: '10000',
            },
            // 代理 {POST}
            'request': '/api/request',
            // baseConfig {POST}
            'baseConfig': '/baseConfig',
            // 根据产品绑定机器人 {POST}
            'bindProduct': '/api/v1/product',
            // 获取机器人状态 {POST}
            'robotStatus': '/api/v1/robot/status',
            // 获取颜色
            'headColor': '/api/v1/robot/dict/c',
        };
        // 保存原始配置信息
        this.config = JSON.parse(JSON.stringify({
            id: this.id,
            root: this.root,
            frame: this.frame,
            toolbar: this.toolbar,
            request: this.request,
        }));

        // 如果开启了拖拽
        if (this.drag) {
            addEvent(window, 'resize', () => {
                width = document.documentElement.clientWidth || document.body.clientWidth;
                height = document.documentElement.clientHeight || document.body.clientHeight;
            });
        }

        // 如果没有passport，就使用window.location.origin
        if (!this.toolbar.query.passport) {
            this.toolbar.query.passport = origin;
        }

        let fields = [
            'token',
            'product',
        ];

        for (let field of fields) {
            // 验证必传参数是否存在
            if (!this.toolbar.query[field]) {
                return LOG(`Parameter option.toolbar.query.${field} does not exist`, 'error');
            }
        }
        const basicInformation = this.basicInformation = (callback) => {
            request
                .postJSON(this.root + this._api.baseConfig)
                .then((res) => {
                    if (res.code === this._api.code.OK) {
                        this.baseConfig = res.data;
                        callback && callback();
                    }
                });
        };
        const headColor = this.headColor = (callback) =>{
            request
                .postJSON(this.root + this._api.request + `?url=${this._api.headColor}`, {
                    url: this._api.headColor,
                    root: 'basic',
                    method: 'get',
                    data: {
                        LOCAL_TOKEN: this.toolbar.query.token,
                    },
                })
                .then((res) => {
                    if (res.code === this._api.code.OK) {
                        switch(res.data.value) {
                            case '1':
                                colors = ' easyOpenIM-color-blue';
                                break;
                            case '2':
                                colors = ' easyOpenIM-color-orange';
                                break;
                            case '3':
                                colors = ' easyOpenIM-color-red';
                                break;
                            case '4':
                                colors = ' easyOpenIM-color-violet';
                                break;
                            case '5':
                                colors = ' easyOpenIM-color-green';
                                break;
                            case '6':
                                colors = ' easyOpenIM-color-black';
                                break;
                        }
                    }
                    callback && callback();
                });
        }
        const bindProduct = () => {
            request
                .postJSON(this.root + this._api.request + `?url=${this._api.bindProduct}`, {
                    url: this._api.bindProduct,
                    root: 'kms',
                    method: 'post',
                    data: {
                        product: this.toolbar.query.product,
                        LOCAL_TOKEN: this.toolbar.query.token,
                    },
                })
                .then((res) => {
                    if (res.code === this._api.code.OK) {
                        // 获取并添加productId参数
                        this.toolbar.query.productId = res.data.productId;
                        this.render();
                    }
                    else {
                        LOG(`Error Message：${res.message || '服务器错误'}`, 'error');
                    }
                });
        };
        const robotStatus = (callback) => {
            request
                .postJSON(this.root + this._api.request + `?url=${this._api.robotStatus}`, {
                    url: this._api.robotStatus,
                    root: 'basic',
                    method: 'post',
                    data: {
                        LOCAL_TOKEN: this.toolbar.query.token,
                    },
                })
                .then((res) => {
                    if (res.code === this._api.code.OK) {
                        // 如果开启了debug模式，直接渲染
                        if (this.toolbar.query.debug) {
                            this.render();
                        }
                        else {
                            // 如果当前机器人的状态是开启
                            if (res.data.status) {
                                callback && callback();
                            }
                            else {
                                LOG(`Error Message：当前机器人状态未开启`, 'info');
                            }
                        }
                    }
                    else {
                        LOG(`Error Message：${res.message || '服务器错误'}`, 'error');
                    }
                });
        };
        robotStatus(() => {
            bindProduct();
        });
    }

    // 开始聊天（外部调用）
    start() {
        let _this = this
        _this.basicInformation(() => {
            loadImage(`${_this.baseConfig.basicHost}/attachment/download/c?code=dialog_box_head&authorization=${_this.toolbar.query.token}`, (url) => {
                if (url) {
                    robotPortrait = url;
                }
            });
            _this.headColor(()=>{
                 _this.createControl();
            })
        });
       
    }

    // 删除聊天（外部调用）
    remove() {
        this.clearControl();
    }

    // 重新启动（外部调用）
    restart() {
        this.clearControl();
        this.start();
        this.animation(true);
    }

    // 渲染框架
    render() {
        let _this = this;
        // 来自frame框架
        this.toolbar.query.origin = true;
        // 配置参数
        this.params = `?${stringfyQueryString(this.toolbar.query)}`;
        // 引入easyOpenIM.css
        createLink(this.root + this.cssURL);
        // 引入依赖iView.css
        this.resource && createLink(this.root + '/library/iview/iview.css');
        // 是否创建工具栏
        this.toolbar.append && this.basicInformation(() => {
            loadImage(`${_this.baseConfig.basicHost}/attachment/download/c?code=web_entrance_icon&authorization=${_this.toolbar.query.token}`, (url) => {
                if (url) {
                    ballIcon = url;
                }
                this.createToolBar();
            });
        });
    }

    // 创建控制器
    createControl() {
        let currentFrame = document.getElementById(this.id);
        // 如果存在，就打开/关闭
        if (currentFrame) {
            this.animation();
        }
        // 如果不存在，就创建
        else {
            this.createFrame();
            this.frame.layer.show && this.createFrameMaskLayer();
        }
    }

    // 删除控制器
    clearControl() {
        let currentFrame = document.getElementById(this.id),
            currentMaskLayer = document.getElementById(this.layerId);
        // 如果存在，就删除
        if (currentFrame) {
            currentFrame.parentNode.removeChild(currentFrame);
        }
        // 如果存在 && 可以显示，就删除
        if (currentMaskLayer && this.frame.layer.show) {
            currentMaskLayer.parentNode.removeChild(currentMaskLayer);
        }
    }

    // 创建框架外壳
    createFrame() {
        let doc = document,
            body = document.body,
            isMobile = bs.device === 'Mobile',
            parent = doc.createElement('div'),
            tc = doc.createElement('div'),
            fc = doc.createElement('iframe');

        // android-volume-off
        // android-volume-up
        // ios-browsers-outline
        tc.className = 'easyOpenIM-title' + colors;
        tc.innerHTML = `
            <div class="easyOpenIM-title-left">
                <img class="robot-lo" src="${robotPortrait}" alt="机器人头像">${this.frame.title}
            </div>
            <div class="easyOpenIM-title-right">
                <a href="javascript:window.$easyOpenIM.start();" title="最小化" style="font-size: 30px;">-</a>
                <a href="javascript:window.$easyOpenIM.remove();" title="关闭">×</a>
            </div>
        `;
        // 如果开启了拖拽，cursor就使用move
        tc.style.cursor = this.drag ? 'move' : 'auto';

        fc.frameBorder = 0;
        fc.name = 'easyOpenIM-frame';
        fc.className = 'easyOpenIM-frame';
        fc.src = `${this.root}/${this.page}${this.params}`;

        // Mobile模式
        if (isMobile) {
            this.drag = false;
            this.frame.width = '100%';
            this.frame.height = '100%';
            this.frame.right = '0';
            this.frame.bottom = '0';
        }

        parent.id = this.id;
        parent.className = 'easyOpenIM';
        parent.setAttribute('style', `
                    width: ${this.frame.width};
                    height: ${this.frame.height};
                    right: ${this.frame.right};
                    bottom: ${this.frame.bottom};
                    margin: ${this.frame.margin};
                    z-index: ${this.frame.zIndex};
                `);

        // 是否开启拖拽功能
        this.drag && drag(parent);

        parent.appendChild(tc);
        parent.appendChild(fc);
        body.appendChild(parent);
    }

    // 创建工具栏
    createToolBar() {
        let doc = document,
            body = document.body,
            tool = doc.createElement('div');

        tool.id = this.toolbarId;
        tool.className = 'easyOpenIM-toolbar';
        tool.setAttribute('style', `
                    right: ${this.toolbar.right};
                    bottom: ${this.toolbar.bottom};
                    margin: ${this.toolbar.margin};
                    z-index: ${this.frame.zIndex - 2};
                `);
        if (this.toolbar.children && this.toolbar.children.length > 0) {
            this.toolbar.children.forEach((item) => {
                let toolChildren = doc.createElement('div');
                toolChildren.className = 'easyOpenIM-toolbar-children';
                toolChildren.title = item.label;
                switch (item.callback) {
                    case 'start':
                        let pic = doc.createElement('img');

                        pic.src = ballIcon;
                        toolChildren.appendChild(pic);
                        break;
                }
                item.callback && addEvent(toolChildren, 'click', () => {
                    this[item.callback] && this[item.callback](this.toolbar.query);
                });
                tool.appendChild(toolChildren);
            });
        }

        body.appendChild(tool);
    }

    // 创建遮罩层
    createFrameMaskLayer() {
        let doc = document,
            body = document.body,
            layer = doc.createElement('div');

        layer.id = this.layerId;
        layer.className = 'easyOpenIM-layer';
        layer.setAttribute('style', `
                    z-index: ${this.frame.zIndex - 1};
                    background-color: ${this.frame.layer.baColor};
                `);
        addEvent(layer, 'click', () => {
            this.animation();
        });

        body.appendChild(layer);
    }

    // 显示/隐藏动画
    animation(isOpen = false) {
        let bottom = '-100%',
            currentFrame = document.getElementById(this.id),
            currentMaskLayer = document.getElementById(this.layerId);

        const stringToMount = (str) => {
            return str.split('px')[0] - 0;
        };
        // 如果存在
        if (currentFrame) {
            // 更新记录最新right
            // 拖拽之后
            if (currentFrame.style.left) {
                let frameLeft = stringToMount(currentFrame.style.left),
                    frameWidth = stringToMount(currentFrame.style.width);
                this.frame.right = (width - frameLeft - frameWidth) + 'px';
            }
            // 更新记录最新bottom
            // 拖拽之后
            if (currentFrame.style.top) {
                let frameTop = stringToMount(currentFrame.style.top),
                    frameHeight = stringToMount(currentFrame.style.height);
                this.config.frame.bottom = (height - frameTop - frameHeight) + 'px';
            }
            // 尚未拖拽
            else {
                if (currentFrame.style.bottom !== bottom) {
                    this.config.frame.bottom = currentFrame.style.bottom;
                }
            }
            this.frame.bottom = isOpen
                ? this.config.frame.bottom
                : ((this.frame.bottom === bottom)
                    ? this.config.frame.bottom
                    : bottom);
            currentFrame.setAttribute('style', `
                    width: ${this.frame.width};
                    height: ${this.frame.height};
                    right: ${this.frame.right};
                    bottom: ${this.frame.bottom};
                    margin: ${this.frame.margin};
                    z-index: ${this.frame.zIndex};
                `);
        }
        if (currentMaskLayer) {
            currentMaskLayer.style.display = (this.frame.bottom === bottom)
                ? 'none'
                : 'block';
        }
    }

    // 静态方法
    static init(config) {
        return window.$easyOpenIM = new EasyOpenIM(config);
    }
}
