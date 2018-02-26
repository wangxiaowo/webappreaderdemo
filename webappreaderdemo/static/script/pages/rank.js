$.get('/ajax/rank', function(d) {
	/*optional stuff to do after success */
	//debugger;
	for(var i = 0; i< d.items.length; i++ ){
		d.items[i].description = d.items[i].description.split('\n');
	}
	var windowwidth = $(window).width();
	if(windowwidth < 320 ){
		windowwidth = 320;
	}
	new Vue({
		el:'#app',
		data:d,
		screen_width:windowwidth
	});
},'json');