# Async-Write
 JavaScript  Write, Writeln, Advertising  async load
 JavaScript Write Writeln 函数 广告 异步加载

##
	/**
	*	write 延迟加载扩展 支持  延迟加载广告等 Google baidu 支持几乎所有的广告商 支持延迟载入统计代码等....
	*
	*	BY: http://www.lianyue.org/  恋月
	*
	*	1 参数 开始 回调函数
	*	2 参数 完成 回调函数 可选 如果没参数3 并且是字符串 这等于 参数 3
	*	3 参数 完成 执行优先级 可选  ready 默认 html 载入完毕就执行  load ＝ 页面所有数据载入完毕才执行
	*
	*
	*	2013-04-14 开始写广告延迟加载代码
	*	2013-11-13 更新直接执行html js
	*	2013-11-14 更新 js 执行方法 jquery 低于 1.7.1 也能执行js
	*	2015-07-24 更新 js 执行方法 不再依赖jquery库  主意  var xxx 如果不是一次性执行的 不能声明  var 比如百度广告里面的 var cpro_id = 00000 需要 替换成   cpro_id ＝ 00000
	*
	*	dom.setWrite(function(){
	*		 //document.write( "html代码执行js需要 <script> 标签 如果不是在js 文件里面 <script> 标签 要写成 '<scr'+'ipt>'   " );
	*	}, function(error){  执行完成后回调可选 }, 延迟我位置);
	*
	**/
