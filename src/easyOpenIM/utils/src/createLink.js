'use strict';

/*
* 动态创建link标签，引入css
* */
export default function createLink(url) {
    let doc = document,
        body = document.body,
        link = doc.createElement('link'),
        head = doc.getElementsByTagName('head')[0];

    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', url);

    head
        ? head.appendChild(link)
        : body.appendChild(link);
};
