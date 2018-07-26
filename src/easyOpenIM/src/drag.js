'use strict';

let offsetX = 0,
    offsetY = 0;

export default function drag(el) {
    const up = () => {
        removeEventListener('mousemove', move);
        removeEventListener('mouseup', up);
    };
    const move = (e) => {
        el.style.left = (e.pageX - offsetX) + 'px';
        el.style.top = (e.pageY - offsetY) + 'px';
    };

    const down = (e) => {
        offsetX = (e.pageX - el.offsetLeft);
        offsetY = (e.pageY - el.offsetTop);
        addEventListener('mousemove', move);
        addEventListener('mouseup', up);
        e.preventDefault();
    };

    el.addEventListener('mousedown', down);
};
