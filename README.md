# clamp
### How to use
```js
<div v-clamp="3"></div>
```
- 思路  
1. 监测是否支持webkit的私有属性，-webkit-line-clamp,如果支持，直接使用该私有属性 
2. 不支持的话则计算`行高 * 要显示的行数` 与 clientHeight 比较，不超出则不加省略号。 
3. 超出的话，在元素上面动态包一层父元素，设置父元素的高度`行高 * 要显示的行数`，style为`overflow:hidden`,动态添加省略号（使用伪类实现） 
