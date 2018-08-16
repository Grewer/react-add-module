## react-add-module

### Notice:

optimize.UglifyJsPlugin 不支持 压缩es6及以上的代码

uglifyjs-webpack-plugin 该插件可支持 es6 的压缩


解决 css 的问题,但是 es5 的代码大小不会打印出来

### Impression
算是一种生硬的实现方案,异步组件和 webpack 4的异步组件还未测试 
webpack 重复生成,会减慢 build 的时间  
vue-cli3 已经有了这种方式,期待下 react-script 的官方指令
