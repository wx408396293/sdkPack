'use strict';

/**
 *
 * @desc   对象序列化
 * @param  {Object} obj
 * @return {String}
 */
export default function stringfyQueryString(obj) {
    if (!obj) return '';
    let pairs = [];

    for (let key in obj) {
        let value = obj[key];

        if (value instanceof Array) {
            for (let i = 0; i < value.length; ++i) {
                pairs.push((key + '[' + i + ']') + '=' + (value[i]));
            }
            continue;
        }

        pairs.push((key) + '=' + (obj[key]));
    }

    return pairs.join('&');
};
