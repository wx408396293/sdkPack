'use strict';

// output format - 'amd', 'cjs', 'es6', 'iife', 'umd'
// amd – 使用像requirejs一样的模块定义
// cjs – CommonJS，适用于node和browserify / Webpack
// es6 (default) – 保持ES6的格式
// iife – 使用于<script> 标签引用的方式
// umd – 适用于CommonJs和AMD风格通用模式
module.exports = [
    // 打包easyOpenIM.js
    {
        format: 'umd',
        uglify: false,
        sourceMap: false,
        moduleName: 'EasyOpenIM',
        entry: 'src/easyOpenIM/index.js',
        dest: '../src/library/easyOpenIM/easyOpenIM.js',
        banner: `
        /*
         * 提供给第三方的JS
         * author: 涂兴声
         * createTime: ${new Date().toLocaleString()}
         * version: 1.0.0
         */
        `,
        moduleContext: {
            'src/easyOpenIM/src/browser.js': 'Browser',
            'src/easyOpenIM/src/request2.js': 'request',
        },
    },
    // 打包easyOpenIM.min.js
    {
        format: 'umd',
        uglify: true,
        sourceMap: false,
        moduleName: 'EasyOpenIM',
        entry: 'src/easyOpenIM/index.js',
        dest: '../src/library/easyOpenIM/easyOpenIM.min.js',
        banner: `
        /*
         * 提供给第三方的JS
         * author: 涂兴声
         * createTime: ${new Date().toLocaleString()}
         * version: 1.0.0
         */
        `,
        moduleContext: {
            'src/easyOpenIM/src/browser.js': 'Browser',
            'src/easyOpenIM/src/request2.js': 'request',
        },
    },
    // 打包easyOpenIM.css
    {
        uglify: false,
        entry: 'src/easyOpenIM/css/easyOpenIM.less',
        dest: '../src/library/easyOpenIM/',
    },
    // 打包easyOpenIM.min.css
    {
        uglify: true,
        entry: 'src/easyOpenIM/css/easyOpenIM.less',
        dest: '../src/library/easyOpenIM/',
        rename: 'easyOpenIM.min.css',
    },
];

