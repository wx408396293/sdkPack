'use strict';

const rollup = require('rollup').rollup;
const rollupApp = require('./rollup.app');
const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify');
const npm = require('rollup-plugin-node-resolve');
const gulp = require('gulp');
const less = require('gulp-less');
const cssMin = require('gulp-css');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');

rollupApp.forEach(function (roll) {
    // 编译Css
    if (/css/.test(roll.entry)) {
        let task = gulp.src(roll.entry)
            .pipe(less())
            .pipe(autoprefixer({
                browsers: [
                    'iOS >= 7',
                    'Android >= 4.1',
                ],
                cascade: false,
            }));
        roll.uglify && task.pipe(cssMin());
        roll.rename && task.pipe(rename(roll.rename));
        return task.pipe(gulp.dest(roll.dest));
    }
    // 编译Js
    if (/js/.test(roll.entry)) {
        rollup({
            entry: roll.entry,
            // moduleContext ID
            moduleContext: roll.moduleContext,
            plugins: [
                npm({jsnext: true, main: true}),
                babel({
                    exclude: 'node_modules/**',
                    presets: [
                        [
                            'es2015',
                            {
                                'modules': false
                            }
                        ]
                    ]
                }),
                roll.uglify && uglify()
            ]
        }).then(function (bundle) {
            bundle.write({
                banner: roll.banner,
                dest: roll.dest,
                format: roll.format,
                sourceMap: roll.sourceMap,
                moduleName: roll.moduleName,
            });
        }).catch(function (err) {
            console.log('错误信息：\n' + err);
        });
    }
});
