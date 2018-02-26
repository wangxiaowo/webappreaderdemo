var sex = location.href.split('/channel/').pop();
//console.log(sex);
$.get('/ajax/channel/' + sex ,function(d){
	//debugger;
	var windowwidth = $(window).width();
	if(windowwidth < 320 ){
		windowwidth = 320;
	}
	new Vue({
		el:'#app',
		data:d,
		screen_width:windowwidth
	});
},'json')