# react-add-module

## Language
- <a href="#english">English</a>
- <a href="#chinese">Chinese</a>

# English

### in conclusion

Is a blunt implementation, asynchronous components of webpack 4 have not been tested
Webpack is generated repeatedly, which will slow down the build time.

Vue-cli3 already has this way, looking forward to the official command of react-script

Solve the problem of css, but the code size of es5 will not be printed

### Build  notices
Although there is a specification now, the JS of the module must add the mjs suffix, but if you do this, you can't run the HTML file after the build locally, you must run it on the server, otherwise you will get an error.

```
Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.
```

### Build Results

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

### Size comparison:
The two main versions differ only in the translation of async/await and polyfill:
Main.js :123k
Main.es5.js :220k

The two chunks differ by one async/await translation:
Es6:
0.chunk.js : 362b = 0.29k
Es5:
0.chunk.js : 2k

## Modification process:
#### First download the required packages:
Listed below:
- "babel-core": "^6.26.0"
- "babel-plugin-syntax-dynamic-import": "^6.18.0"
- "babel-plugin-transform-class-properties": "^6.24.1"
- "babel-polyfill": "^6.26.0"
- "babel-preset-env": "^1.7.0"
- "babel-preset-react": "^6.24.1"
- "html-webpack-add-module-plugin": "^1.0.3"
- "uglifyjs-webpack-plugin": "^1.2.7"

Remove the babel parameter in package.json

Copy /config/webpack.config.prod.js in the current directory, named webpack.config.prod.es5.js

#### In prod.js:
Add a reference:
```js
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const htmlWebpackAddModulePlugin = require('html-webpack-add-module-plugin')
const fs = require('fs')
```
Description:
> UglifyJsPlugin is because webpack.optimize.UglifyJsPlugin can't compress es6 or above code, so the plugin is needed   
htmlWebpackAddModulePlugin is a plugin that can convert generated scripts to module or nomodule   
Fs is a series of operations on the file, here is only used to determine whether the file exists  

Modify the code:
Modify `test: /\.(js|jsx|mjs)$/` in oneOf to change its options to
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
You can remove `include: paths.appSrc` (note that if you do this, it may cause some errors)

Add a plugin to the plugins:
```js
     new htmlWebpackAddModulePlugin({
       module: 'all',
     }),
     new UglifyJsPlugin(),
```
Comment webpack.optimize.UglifyJsPlugin plugin:
```js
    // new webpack.optimize.UglifyJsPlugin({
    //compress: {
    // warnings: false,
    // // Disabled because of an issue with Uglify breaking seemingly valid code:
    // // https://github.com/facebookincubator/create-react-app/issues/2376
    // // Pending further investigation:
    // // https://github.com/mishoo/UglifyJS2/issues/2011
    // comparisons: false,
    // },
    // mangle: {
    // safari10: true,
    // },
    // output: {
    // comments: false,
    // // Turned on because emoji and regex is not minified properly using default
    // // https://github.com/facebookincubator/create-react-app/issues/2488
    // ascii_only: true,
    // },
    // sourceMap: shouldUseSourceMap,
    // }),
```
Modify the HtmlWebpackPlugin plugin to:
```js
    new HtmlWebpackPlugin({
      inject: true,
      template: fs.existsSync(`${paths.appBuild}/index.html`) ? `${paths.appBuild}/index.html` : paths.appHtml,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
```

**webpack.config.prod.js has been modified so far**

---

#### Modified in webpack.config.prod.es5.js

Add package reference:
```js
const htmlWebpackAddModulePlugin = require('html-webpack-add-module-plugin')
```
Modify the entry name:
```js
  entry: {
    'main.es5': [require.resolve('./polyfills'),"babel-polyfill", paths.appIndexJs]
  },
```

Modify the babel loader options in oneOf as before:
```js
            options: {
              presets: [
                ['env', {
                  modules: false,
                  useBuiltIns: true,
                  targets: {
                    browsers: [
                      "> 1%",
                      'last 2 version',
                      'firefox ESR'
                    ]
                  },
                }],
                "react"
              ],
              plugins: ["transform-class-properties", "syntax-dynamic-import"],
              compact: true,
            },
```
Add a plugin:
```js
     new htmlWebpackAddModulePlugin({
       nomodule: 'all',
       removeCSS: 'main'
     }),
```

**webpack.config.prod.es5.js has been modified so far**

---


### Start modifying the /scripts/build.js file:

Add a reference to the es5 config file:
```js
const es5config = require('../config/webpack.config.prod.es5');
```

Add a function before the build function:
```js
function compiler(config, previousFileSizes, prevResult) {
  return new Promise((resolve, reject) => {
    config.run((err, stats) => {
      if (err) {
        return reject(err);
      }
      const messages = formatWebpackMessages(stats.toJson({}, true));
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        return reject(new Error(messages.errors.join('\n\n')));
      }
      if (
        process.env.CI &&
        (typeof process.env.CI !== 'string' ||
          process.env.CI.toLowerCase() !== 'false') &&
        messages.warnings.length
      ) {
        console.log(
          chalk.yellow(
            '\nTreating warnings as errors because process.env.CI = true.\n' +
            'Most CI servers set it automatically.\n'
          )
        );
        return reject(new Error(messages.warnings.join('\n\n')));
      }
      // console.log(stats)
      let result = {
        stats,
        previousFileSizes,
        warnings: messages.warnings,
      }

      if (prevResult) {
        result.prevResult = prevResult
      }
      return resolve(result);
    });
  });

}
```
Modify the just build function to:
```js
async function build(previousFileSizes) {
  console.log('Creating an optimized production build...');

  let modernConfig = webpack(config);
  let es5Config = webpack(es5config)
  let result = await compiler(es5Config, previousFileSizes);
  // remove main.es5.css
  let arr = Object.keys(result.stats.compilation.assets)
  const path = arr.find(v => v.indexOf('css') > -1 && v.indexOf('main') > -1)
  await fs.remove(result.previousFileSizes.root + '/' + path)

  result = await compiler(modernConfig, previousFileSizes, result);

  return result
}
```
Add after <div id="root"></div> in /public/index.html :
```js
<script>
      (function() {
        var check = document.createElement('script');
        if (!('noModule' in check) && 'onbeforeload' in check) {
          var support = false;
          document.addEventListener('beforeload', function(e) {
            if (e.target === check) {
              support = true;
            } else if (!e.target.hasAttribute('nomodule') || !support) {
              return;
            }
            e.preventDefault();
          }, true);
          check.type = 'module';
          check.src = '.';
          document.head.appendChild(check);
          check.remove();
        }
      }());
    </script>
```
Solve the problem of repeated loading of safari

The basic changes are here, then run the command: `npm run build`



# Chinese

### 结论

算是一种生硬的实现方案,webpack 4的异步组件还未测试 
webpack 重复生成,会减慢 build 的时间  

vue-cli3 已经有了这种方式,期待下 react-script 的官方指令  

解决 css 的问题,但是 es5 的代码大小不会打印出来

### Build 注意点

虽然现在有一个规范，模块的JS必须添加mjs后缀，但是如果这样做，你不能在本地构建后运行HTML文件，你必须在服务器上运行它，否则你报错:
```
Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.
```

### Build 结果

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
#### 首先下载需要的包:  
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

#### 在 prod.js 中:  
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
可以将 `include: paths.appSrc` 去除(注意,如果这样做,可能会引起某些错误)

在 plugins 中添加插件:  
```js
    new htmlWebpackAddModulePlugin({
      module: 'all',
    }),
    new UglifyJsPlugin(),
```
注释 webpack.optimize.UglifyJsPlugin 插件:  
```js
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false,
    //     // Disabled because of an issue with Uglify breaking seemingly valid code:
    //     // https://github.com/facebookincubator/create-react-app/issues/2376
    //     // Pending further investigation:
    //     // https://github.com/mishoo/UglifyJS2/issues/2011
    //     comparisons: false,
    //   },
    //   mangle: {
    //     safari10: true,
    //   },
    //   output: {
    //     comments: false,
    //     // Turned on because emoji and regex is not minified properly using default
    //     // https://github.com/facebookincubator/create-react-app/issues/2488
    //     ascii_only: true,
    //   },
    //   sourceMap: shouldUseSourceMap,
    // }),
```
修改 HtmlWebpackPlugin 插件为:
```js
    new HtmlWebpackPlugin({
      inject: true,
      template: fs.existsSync(`${paths.appBuild}/index.html`) ? `${paths.appBuild}/index.html` : paths.appHtml,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
```

**webpack.config.prod.js的修改到此为止**

---

#### 在 webpack.config.prod.es5.js 中修改

添加包引用:
```js
const htmlWebpackAddModulePlugin = require('html-webpack-add-module-plugin')
```
修改入口名:
```js
  entry: {
    'main.es5': [require.resolve('./polyfills'),"babel-polyfill", paths.appIndexJs]
  },
```

与之前一样的修改 oneOf 中的 babel loader 的 options:
```js
            options: {
              presets: [
                ['env', {
                  modules: false,
                  useBuiltIns: true,
                  targets: {
                    browsers: [
                      "> 1%",
                      'last 2 version',
                      'firefox ESR'
                    ]
                  },
                }],
                "react"
              ],
              plugins: ["transform-class-properties", "syntax-dynamic-import"],
              compact: true,
            },
```
添加插件:
```js
    new htmlWebpackAddModulePlugin({
      nomodule: 'all',
      removeCSS: 'main'
    }),
```

**webpack.config.prod.es5.js的修改到此为止**

---

### 开始修改 /scripts/build.js 文件:

添加 es5 config 文件的引用:
```js
const es5config = require('../config/webpack.config.prod.es5');
```

在 build 函数之前添加函数:
```js
function compiler(config, previousFileSizes, prevResult) {
  return new Promise((resolve, reject) => {
    config.run((err, stats) => {
      if (err) {
        return reject(err);
      }
      const messages = formatWebpackMessages(stats.toJson({}, true));
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        return reject(new Error(messages.errors.join('\n\n')));
      }
      if (
        process.env.CI &&
        (typeof process.env.CI !== 'string' ||
          process.env.CI.toLowerCase() !== 'false') &&
        messages.warnings.length
      ) {
        console.log(
          chalk.yellow(
            '\nTreating warnings as errors because process.env.CI = true.\n' +
            'Most CI servers set it automatically.\n'
          )
        );
        return reject(new Error(messages.warnings.join('\n\n')));
      }
      // console.log(stats)
      let result = {
        stats,
        previousFileSizes,
        warnings: messages.warnings,
      }

      if (prevResult) {
        result.prevResult = prevResult
      }
      return resolve(result);
    });
  });

}
```
修改刚刚的 build 函数为:
```js
async function build(previousFileSizes) {
  console.log('Creating an optimized production build...');

  let modernConfig = webpack(config);
  let es5Config = webpack(es5config)
  let result = await compiler(es5Config, previousFileSizes);
  // remove main.es5.css
  let arr = Object.keys(result.stats.compilation.assets)
  const path = arr.find(v => v.indexOf('css') > -1 && v.indexOf('main') > -1)
  await fs.remove(result.previousFileSizes.root + '/' + path)

  result = await compiler(modernConfig, previousFileSizes, result);

  return result
}
```
在 /public/index.html 中的 <div id="root"></div>后面添加:
```js
<script>
      (function() {
        var check = document.createElement('script');
        if (!('noModule' in check) && 'onbeforeload' in check) {
          var support = false;
          document.addEventListener('beforeload', function(e) {
            if (e.target === check) {
              support = true;
            } else if (!e.target.hasAttribute('nomodule') || !support) {
              return;
            }
            e.preventDefault();
          }, true);
          check.type = 'module';
          check.src = '.';
          document.head.appendChild(check);
          check.remove();
        }
      }());
    </script>
```
解决 safari 的重复加载问题

基础的修改到此为止了,接下来运行指令 : `npm run build` 即可