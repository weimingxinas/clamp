import Vue from 'vue';
class Clamp {
    constructor (opt) {
        this.supportsNativeClamp = typeof (document.documentElement.style.webkitLineClamp) !== 'undefined';
        this.className = '_line_clamp_custom_directive';
        this.el = opt.el;
        this.clamp = parseInt(opt.clamp) || 2;
        this.init();
    }

    /**
     * Return the current style for an element.
     * @param {HTMLElement} elem The element to compute.
     * @param {string} prop The style property.
     * @returns {number}
     */
    computeStyle (elem, prop) {
        if (!window.getComputedStyle) {
            window.getComputedStyle = function (el, pseudo) {
                this.el = el;
                this.getPropertyValue = function (prop) {
                    const re = /(-([a-z]){1})/g;
                    if (prop === 'float') prop = 'styleFloat';
                    if (re.test(prop)) {
                        prop = prop.replace(re, function () {
                            return arguments[2].toUpperCase();
                        });
                    }
                    return el.currentStyle && el.currentStyle[prop] ? el.currentStyle[prop] : null;
                };
                return this;
            };
        }
        return window.getComputedStyle(elem, null).getPropertyValue(prop);
    }

    /**
     * Return the current style for an element.
     * @param {HTMLElement} elem The element to compute.
     * @returns {number}
     */
    getLineHeight (elem) {
        let lh = this.computeStyle(elem, 'line-height');
        if (lh === 'normal') {
            // Normal line heights vary from browser to browser. The spec recommends
            // a value between 1.0 and 1.2 of the font size. Using 1.1 to split the diff.
            // line height 每个浏览器各有差异。normal的情况为默认值，浏览器会计算出“合适”的行高，
            // 多数浏览器（Georgia字体下）取值为1.14，即为font-size的1.14倍，如果未设定font-size，
            // 那既是基准值16px的1.14倍
            lh = parseInt(this.computeStyle(elem, 'font-size')) * 1.2;
        }
        return parseInt(lh);
    }

    /**
     * 动态添加class
     */
    addStyle () {
        const hasStyle = !!document.getElementById('lineClampCustomDirective');
        if (!hasStyle) {
            const sty = document.createElement('style');
            sty.type = 'text/css';
            sty.id = 'lineClampCustomDirective';
            const str = `.${this.className} {
                position: relative;
                overflow: hidden;
            }
            .${this.className}::after {
                content: "..."; position: absolute; bottom: 0; right: 0; padding-left: 40px;
                background: -webkit-linear-gradient(left, transparent, #fff 55%);
                background: -o-linear-gradient(right, transparent, #fff 55%);
                background: -moz-linear-gradient(right, transparent, #fff 55%);
                background: linear-gradient(to right, transparent, #fff 55%);
            }`;
            // ie use styleSheet.csstext
            sty.styleSheet ? sty.styleSheet.cssText = str : sty.innerHTML = str;
            document.getElementsByTagName('head')[0].appendChild(sty);
        }
    }
    getMaxHeight () {
        const lineHeight = this.getLineHeight(this.el);
        return lineHeight * this.clamp;
    }

    /**
     * init
     */
    init () {
        const sty = this.el.style;
        if (this.supportsNativeClamp) {
            sty.overflow = 'hidden';
            sty.textOverflow = 'ellipsis';
            sty.webkitBoxOrient = 'vertical';
            sty.display = '-webkit-box';
            sty.webkitLineClamp = this.clamp;
        } else {
            const height = this.getMaxHeight(this.clamp);
            if (height <= this.el.clientHeight) {
                sty.overflow = 'visible';
                this.addStyle();
                const newEl = document.createElement('div');
                newEl.classList.add(this.className);
                newEl.style.height = height + 'px';
                this.el.parentNode.replaceChild(newEl, this.el);
                newEl.appendChild(this.el);
            }
        }
    }
}
Vue.directive('clamp', {
    // 当被绑定的元素插入到 DOM 中时……
    inserted: function (el, binding, vnode, oldVnode) {
        if (!binding.value) return false;
        /* eslint-disable no-new */
        new Clamp({
            el,
            clamp: binding.value
        });
    }
});
