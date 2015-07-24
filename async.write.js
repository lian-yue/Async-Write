/**
*	write 延迟加载扩展 支持  延迟加载广告等 Google baidu 支持几乎所有的广告商 支持延迟载入统计代码等....
*
*	BY: http://www.lianyue.org/  恋月
*
*	1 参数 开始 回调函数
*	2 参数 完成 回调函数 可选
*
*
*	2013-04-14 开始写广告延迟加载代码
*	2013-11-13 更新直接执行html js
*	2013-11-14 更新 js 执行方法 jquery 低于 1.7.1 也能执行js
*	2015-07-24 更新 js 执行方法 不再依赖jquery库  主意  var xxx 如果不是一次性执行的 不能声明  var 比如百度广告里面的 var cpro_id = 00000 需要 替换成   cpro_id ＝ 00000
*
*	dom.setWrite(function(){
*		 //document.write( "html代码执行js需要 <script> 标签 如果不是在js 文件里面 <script> 标签 要写成 '<scr'+'ipt>'   " );
*	}, function(){  执行完成后回调可选 }, 延迟我位置);
*
**/
;(function(w, d) {
	var e = w.HTMLElement, data = {}, original = {write:d.write,writeln:d.writeln}, progress = 0, processing = false;
	var log = function(a) {
		console && console.log(a);
	}

	var UUID = function() {
		var arrays = 'qwertyuiopasdfghjklzxcvbnmQWERTUIOPASDFGHJKLZXCVBNM', result = '';
		arrays = arrays.split('');
		for(var i = 0;  i < 20; i++) {
			result += arrays[Math.floor( Math.random() * arrays.length)];
		}
		return result;
	}

	var load = function(element, callback, success) {
		log('Begin ID: ' + element.writeUUID);
		var fn = [{callback:callback, element: false}], writeHTML = '';

		// 修改2个函数
		d.write = function() {
			for (var i = 0; i < arguments.length; i++) {
				writeHTML += arguments[i];
			}
		};
		d.writeln = function() {
			for (var i = 0; i < arguments.length; i++) {
				writeHTML += arguments[i] + "\n";
			}
		};


		var inner = function() {

			// 没有队列了
			if (!fn.length) {
				success.apply(element, [false]);
				d.write = original.write;
				d.writeln = original.writeln;
				processing = false;
				delete element.writeUUID;
				log('End');
				log('');
				setTimeout(listener, 5);
				return;
			}

			// 导出 并删除队列第一个
			var obj = fn.shift();



			var onload = function() {
				if (writeHTML) {
					var divElement = d.createElement('div');
					divElement.innerHTML = writeHTML;
					writeHTML = '';

					// 过滤 js 标签
					scriptElements = divElement.getElementsByTagName('script');
					var index = 0;
					while (scriptElements.length) {
						var spanElement = d.createElement('span');
						spanElement.setAttribute('style', 'display: none!important;');
						var scriptElement = scriptElements[0].parentNode.replaceChild(spanElement, scriptElements[0]);
						fn.splice(index, 0, {callback: scriptElement, element: spanElement});
						++index;
					}

					// 插入节点
					while (divElement.childNodes.length) {
						obj.element.parentNode.insertBefore(divElement.childNodes[0], obj.element);
					}
					obj.element.parentNode.removeChild(obj.element);
				}
				inner();
			};

			var onerror = function() {
				success.apply(element, [true]);
				d.write = original.write;
				d.writeln = original.writeln;
				processing = false;
				delete element.writeUUID;
				log('Error');
				log('End');
				log('');
				setTimeout(listener, 5);
				return;
			};


			// 执行 js
			if (obj.element) {
				// 直接插入到节点
				if (obj.callback.src) {
					log('Loading files URL: ' + obj.callback.src);
					var scriptElement = document.createElement('script');
					var names = ['type', 'style', 'src', 'async'];
					for (var i = 0; i < names.length; i++) {
						if (obj.callback[names[i]]) {
							scriptElement[names[i]] = obj.callback[names[i]];
						}
					}
					if (scriptElement.addEventListener) {
						scriptElement.addEventListener('load', onload, false);
						scriptElement.addEventListener('error', onerror, false);
					} else if (scriptElement.attachEvent) {
						scriptElement.attachEvent('onload', onload);
						scriptElement.attachEvent('onerror', onerror);
					}
					obj.element.parentNode.insertBefore(scriptElement, obj.element);
				} else {
					var name = UUID();
					w[name] = obj.callback.innerHTML.replace(/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g, "");
					log('Run variable Name: ' + name);
					try {
						eval(w[name]);
					} catch (err) {
						onerror();
						return;
					}
					onload();
				}
			} else {
				log('Run callback');
				if (typeof(obj.callback) == 'string') {
					d.write(obj.callback);
				} else if (obj.callback) {
					obj.callback.apply(element);
				}
				obj.element = d.createElement('span');
				obj.element.setAttribute('style', 'display: none!important;');
				element.appendChild(obj.element);
				onload();
			}
		}

		inner();
	}


	var listener = function() {
		if (processing || !data) {
			return;
		}
		for (var k in data) {
			if (progress == 2 || data[k][3] != 'load') {
				if (!processing) {
					processing = true;
					var args = data[k];
					delete data[k];
					load.apply(null, args);
					return;
				}
			}
		}
	}



	e.prototype.setWrite = function(callback, success, event) {
		if (this.writeUUID) {
			return false;
		}
		if (typeof(success) != 'function' && typeof(success) != 'object') {
			if (typeof(event) != 'string' && typeof(success) == 'string') {
				event = success;
			}
			success = function() {

			};
		}
		if (typeof(event) != 'string') {
			event = 'ready';
		}
		this.writeUUID = UUID();
		data[this.writeUUID] = [this, callback, success, event];
		if (progress == 2) {
			listener();
		}
		return true;
	};


	e.prototype.removeWrite = function() {
		if (!this.writeUUID) {
			return false;
		}
		delete data[this.writeUUID];
		delete this.writeUUID;
		return true;
	};


	var listenerDOMLoad = function() {
		progress = 1;
		listener();
	};

	var listenerLoad = function() {
		progress = 2;
		listener();
	};

	// 钩子
	if (w.addEventListener) {
		d.addEventListener('DOMContentLoaded', listenerDOMLoad, false);
		w.addEventListener('load', listenerLoad, false);
	} else if (w.attachEvent) {
		(function () {
			try {
				d.documentElement.doScroll('left');
			} catch (err) {
				setTimeout(arguments.callee, 10);
				return;
			}
			listenerDOMLoad();
		})();
		w.attachEvent('onload', listenerLoad);
	}
})(window, document);
