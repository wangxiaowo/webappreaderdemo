$.get('/ajax/category',function(d){
	debugger;
	var windowwidth = $(window).width();
	if(windowwidth < 320 ){
		windowwidth = 320;
	}
	new Vue({
		el: '#app',
		data:d,
		screen_width:windowwidth
	})
},'json')