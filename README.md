## react-add-module

### Notice:

optimize.UglifyJsPlugin 不支持 压缩es6及以上的代码

uglifyjs-webpack-plugin 该插件可支持 es6 的压缩


解决 css 的问题,但是 es5 的代码大小不会打印出来

### Impression
算是一种生硬的实现方案, webpack 4的异步组件还未测试   
webpack 重复生成,会减慢 build 的时间    
vue-cli3 已经有了这种方式,期待下 react-script 的官方指令  

虽然现在有规范, module 的 JS 都要添加 mjs 后缀,但是现在不要这么做
会报错:
```
Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.
```

### Build result

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
    <meta name="theme-color" content="#000000">
    <link rel="manifest" href="./manifest.json">
    <link rel="shortcut icon" href="./favicon.ico">
    <title>React App</title>
    <script>!function () {
      var t = document.createElement("script");
      if (!("noModule" in t) && "onbeforeload" in t) {
        var n = !1;
        document.addEventListener("beforeload", function (e) {
          if (e.target === t) n = !0; else if (!e.target.hasAttribute("nomodule") || !n) return;
          e.preventDefault()
        }, !0), t.type = "module", t.src = ".", document.head.appendChild(t), t.remove()
      }
    }()</script>
    <link href="./static/css/main.c17080f1.css" rel="stylesheet">
</head>
<body>
<noscript>You need to enable JavaScript to run this app.</noscript>
<div id="root"></div>
<script src="./static/js/main.es5.bfc0d013.js" nomodule></script>
<script src="./static/js/main.eee0168c.js" type="module"></script>
</body>
</html>
```

### 大小比较:
两个 main 版本只相差 async/await 和 polyfill 的转译:  
main.js     :123k  
main.es5.js :220k  

两个 chunk 相差一个 async/await 的转译:  
es6:  
0.chunk.js : 362b = 0.29k  
es5:  
0.chunk.js : 2k

## 修改过程: 
首先下载需要的包:  
下面列出:
- "babel-core": "^6.26.0"
- "babel-plugin-syntax-dynamic-import": "^6.18.0"
- "babel-plugin-transform-class-properties": "^6.24.1"
- "babel-polyfill": "^6.26.0"
- "babel-preset-env": "^1.7.0"
- "babel-preset-react": "^6.24.1"
- "html-webpack-add-module-plugin": "^1.0.3"
- "uglifyjs-webpack-plugin": "^1.2.7"

去除 package.json 中的 babel 参数  

复制 /config/webpack.config.prod.js 一份在当前目录, 命名为 webpack.config.prod.es5.js

在 prod.js 中:  
添加引用:
```js
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const htmlWebpackAddModulePlugin = require('html-webpack-add-module-plugin')
const fs = require('fs')
```
说明:  
> UglifyJsPlugin 是因为 webpack.optimize.UglifyJsPlugin 无法压缩 es6 以上的代码所以需要该插件
htmlWebpackAddModulePlugin 是可以将 生成的 script 转换为 module 或者 nomodule 的插件
fs 是可以对于文件进行一系列操作,这里只是用来判断文件是否存在

修改代码:  
修改 oneOf 中的 `test: /\.(js|jsx|mjs)$/` 该 loader 将其 options 改为
```js
            options: {
              presets: [
                ['env', {
                  modules: false,
                  useBuiltIns: true,
                  targets: {
                    browsers: [
                      'Chrome >= 60',
                      'Safari >= 10.1',
                      'iOS >= 10.3',
                      'Firefox >= 54',
                      'Edge >= 15',
                    ]
                  },
                }],
                "react",
              ],
              plugins: ["transform-class-properties", "syntax-dynamic-import"],
              compact: true
            }
```