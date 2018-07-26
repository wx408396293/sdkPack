'use strict';

export default function loadImage(url, callback) {
    let img = new Image(),
        _src = url;
    img.src = _src;
    img.onload = function () {
        callback && callback(_src);
    };
    img.onerror = function () {
        callback && callback();
    };
};