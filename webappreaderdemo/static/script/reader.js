(function(){
			var Util = (function(){
				var prefix = 'html5_reader_';
				var StorageGetter = function(key){
					return localStorage.getItem(prefix + key);
				}
				var StorageSetter = function(key,val){
					return localStorage.setItem(prefix + key,val);
				}
				var getBSONP = function(url, callback){
					return $.jsonp({
						url: url,
						cache: true,
						callback: 'duokan_fiction_chapter',
						success: function(result){
							// debugger;
							var data = $.base64.decode(result);
							var json = decodeURIComponent(escape(data));
							callback(json);
						}
					});
				}
				return{
					getBSONP:getBSONP,
					StorageSetter:StorageSetter,
					StorageGetter:StorageGetter
				}
			})();

			var Dom = {
				top_nav : $('#top-nav'),
				bottom_nav : $('.bottom_nav'),
				font_container: $('.font-container'),
				font_button: $('#font_button')
			}
			var Win = $(window);
			var Doc = $(document);
			var Body = $("body");
			var readerModel;
			var readerUI;
			var RootContainer = $('#fiction_container');
			var initFontSize = Util.StorageGetter('font_size');
			initFontSize = parseInt(initFontSize);
			if(!initFontSize){
				initFontSize = 14;
			}
			RootContainer.css('font-size', initFontSize);

			var initBackgrount = Util.StorageGetter('background_color') || "#e9dfc7";
			RootContainer.css('background', initBackgrount);
			switch(initBackgrount){
				case ("#fff"):
					$('.bk-container-current').hide();
					$('.bkbright').find('.bk-container-current').show();
					break;
				case ("#e9dfc7"):
					$('.bk-container-current').hide();
					$('.bkpink').find('.bk-container-current').show();
					break;
				case ("#a4a4a4"):
					$('.bk-container-current').hide();
					$('.bkgray').find('.bk-container-current').show();
					break;
				case ("#cdefce"):
					$('.bk-container-current').hide();
					$('.bkgreen').find('.bk-container-current').show();
					break;
				case ("#283548"):
					$('.bk-container-current').hide();
					$('.bkblue').find('.bk-container-current').show();
					break;
				case ("#0f1410"):
					$('.bk-container-current').hide();
					$('.bkdark').find('.bk-container-current').show();
					break;
			}


			function main(){
				//todo 整个项目的入口函数

				readerModel = ReaderModel();
				readerUI = ReaderBaseFrame(RootContainer);

				readerModel.init(function(data){
					readerUI(data);
				});
				EventHanlder();
			}

			function ReaderModel(){
				//todo 实现可阅读器相关的数据交互的方法
				var Chapter_id;
				var ChapterTotal;
				//获取章节信息的入口函数
				var init = function(UIcallback){
					/*
					getFictionInfo(function(data){
						getCurChapterContent(Chapter_id,function(data){
							//todo...
							UIcallback && UIcallback(data);
						});
					})
					*/
					getFictionInfoPromise().then(function(d){
						return getCurChapterContentPromise();
					}).then(function(data){
						UIcallback && UIcallback(data);
					});
				};
				var getFictionInfo = function(callback){
					$.get("/ajax/chapter",function(data){
						//todo 获得章节信息之后的回调
						//先判断本地是否有页码信息
						if(Util.StorageGetter("chapter_id")){
							Chapter_id = Util.StorageGetter("chapter_id");
						}else{
							Chapter_id = data.chapters[1].chapter_id;
						}
						//总共章节数，但是数据不是从服务器上取的，本地数据只有4，所以，目前写死好一点
						//ChapterTotal = data.chapters.length;
						callback && callback(data);
					},'json');
				};

				var getFictionInfoPromise = function(){
					return new Promise(function(resolve,reject){
						$.get('/ajax/chapter',function(data){
							if(data.result == 0){
								Chapter_id = Util.StorageGetter('chapter_id');
								if(Chapter_id == null){
									Chapter_id = data.chapters[1].chapter_id;
								}
								resolve();
							}else{
								reject();
							}
						},'json');
					});
				}

				var getCurChapterContent = function(chapter_id,callback){
					$.get('/ajax/chapter_data',{
						id:Chapter_id
					}, function(data){
						if(data.result == 0){
							var url = data.jsonp;
							Util.getBSONP(url, function(data){
								//debugger;
								callback && callback(data);
							});
						}
					}, 'json');
				}

				var getCurChapterContentPromise = function(){
					return new Promise(function(resolve, reject){
						$.get('/ajax/chapter_data' ,{
							id:Chapter_id
						}, function(data){
							if(data.result == 0){
								var url = data.jsonp;
								Util.getBSONP(url, function(data){
									//callback && callback(data);
									resolve(data);
								});
							}else{
								reject({msg:'fail'});
							}
						},'json');
					});
				}

				var prevChapter = function(UIcallback){
					Chapter_id = parseInt(Chapter_id,10);
					if(Chapter_id == 1){
						console.log("prevlimit");
						return;
					}
					Chapter_id -= 1;
					Util.StorageSetter("chapter_id", Chapter_id)
					getCurChapterContent(Chapter_id,UIcallback); 
					console.log(Chapter_id+"prev");
				}
				var nextChapter = function(UIcallback){
					Chapter_id = parseInt(Chapter_id,10);
					if(Chapter_id == 4){
						console.log("nextlimit");
						return;
					} 
					Chapter_id += 1;
					Util.StorageSetter("chapter_id", Chapter_id);
					getCurChapterContent(Chapter_id,UIcallback);
					console.log(Chapter_id+"");
				}
				return {
					init: init,
					prevChapter: prevChapter,
					nextChapter: nextChapter
				}
			}

			function ReaderBaseFrame(container){
				//todo 渲染基本的UI结构
				function parseChapterData(data){
					var jsonObj = JSON.parse(data);
					var html = '<h4>' + jsonObj.t + '</h4>';
					for (var i = 0; i < jsonObj.p.length; i++) {
						html += '<p>' + jsonObj.p[i] + '</p>';
					}
					return html;
				}
				return function(data){
					container.html(parseChapterData(data));
				};
			}
			
			function EventHanlder(){
				//todo 交互的实践绑定
				$('#action_mid').click(function(){
					if(Dom.top_nav.css('display') == 'none'){
						Dom.bottom_nav.show();
						Dom.top_nav.show();
					}else{
						Dom.top_nav.hide();
						Dom.bottom_nav.hide();
						Dom.font_container.hide();
						Dom.font_button.removeClass('current')
					}
				});

				Dom.font_button.click(function() {
					if (Dom.font_container.css('display') == 'none') {
						Dom.font_container.show();
						Dom.font_button.addClass('current')
					}else{
						Dom.font_container.hide();
						Dom.font_button.removeClass('current')
					}
				});

				$('#nignt_button').click(function() {
					//Todo 触发背景切换事件
					const color = "#0f1410";
					RootContainer.css('background', color);
					$('.bk-container-current').hide();
					$('.bkdark').find('.bk-container-current').show();
					Util.StorageSetter('background_color', color);
				});

				$('.bkbright').click(function() {
						/* Act on the event */
						const color = "#fff";
						RootContainer.css('background', color);
						$('.bk-container-current').hide();
						$(this).find('.bk-container-current').show();
						Util.StorageSetter('background_color', color);
					});
				$('.bkpink').click(function() {
						/* Act on the event */
						const color = "#e9dfc7";
						RootContainer.css('background', color);
						$('.bk-container-current').hide();
						$(this).find('.bk-container-current').show();
						Util.StorageSetter('background_color', color);
					});
				$('.bkgray').click(function() {
						/* Act on the event */
						const color = "#a4a4a4";
						RootContainer.css('background', color);
						$('.bk-container-current').hide();
						$(this).find('.bk-container-current').show();
						Util.StorageSetter('background_color', color);
					});
				$('.bkgreen').click(function() {
						/* Act on the event */
						const color = "#cdefce";
						RootContainer.css('background', color);
						$('.bk-container-current').hide();
						$(this).find('.bk-container-current').show();
						Util.StorageSetter('background_color', color);
					});
				$('.bkblue').click(function() {
						/* Act on the event */
						const color = "#283548";
						RootContainer.css('background', color);
						$('.bk-container-current').hide();
						$(this).find('.bk-container-current').show();
						Util.StorageSetter('background_color', color);
					});
				$('.bkdark').click(function() {
						/* Act on the event */
						const color = "#0f1410";
						RootContainer.css('background', color);
						$('.bk-container-current').hide();
						$(this).find('.bk-container-current').show();
						Util.StorageSetter('background_color', color);
					});

				$('#large-font').click(function() {
					/* Act on the event */
					if(initFontSize > 20){
						return;
					}
					initFontSize  += 1;
					RootContainer.css('font-size', initFontSize);
					Util.StorageSetter('font_size', initFontSize);
				});

				$('#small-font').click(function() {
					/* Act on the event */
					if(initFontSize <= 12){
						return;
					}
					initFontSize -= 1;
					RootContainer.css('font-size', initFontSize);
					Util.StorageSetter('font_size', initFontSize);
				});

				Win.scroll(function(){
					Dom.bottom_nav.hide();
					Dom.top_nav.hide();
					Dom.font_container.hide();
					Dom.font_button.removeClass('current');
				});

				$('#prev_button').click(function() {
					/* 获得章节的翻页数据，吧数据拿出来渲染 */
					readerModel.prevChapter(function(data){
						readerUI(data);
					});
				});

				$('#next_button').click(function() {
					/* Act on the event */
					readerModel.nextChapter(function(data){
						readerUI(data);
					});
				});
			}

			main();


		})();