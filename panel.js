var Panel=function(req,res){
	this.req=req;
	this.res=res;
}
Panel.prototype.is_authorized=function(){
	return (this.user && this.user.is_authorized())?true:false;
}
Panel.prototype.authorize=function(cookie){
	if(!cookie){
		return false;
	}
	var dd=cookie.split('_');
	if(dd.length<2)
		return false;
	var user=parseInt(dd[0]);
	if(this.is_authorized())
		return true;
	if(!global.cache.isset('logins',user)){
		return false;
	}
	var d=global.cache.get('logins',user);
	if(dd[1]===d.cookie){
		this.user=d.user;
		return true;
	}
	return false;
}
Panel.prototype.get_cookie=function(){
	if(!this.is_authorized())
		return false;
	return this.user.get_cookie();
}
Panel.prototype.register=function(username,password,callback){
	if(this.is_authorized()){
		this.open_panel('main');
		return;
	}
	var user = require('./user.js');
	this.user=new user();
	this.register(username,password,callback);
}
Panel.prototype.login=function(username,password,callback){
	if(this.is_authorized()){
		this.open_panel('main');
		return;
	}
	var user = require('./user.js');
	this.user=new user();
	this.login(username,password,callback);
}
Panel.prototype.open_panel=function(page,data){
	var path = require('path');
	switch(page){
		case 'login':
			
			this.res.render('login',{title:global.config.title});
			break;
		default:
			this.res.sendFile(path.join(__dirname + '/html/index.html'));
			break;
	}
}
Panel.prototype.error=function(code,text){
	this.res.render('error',{code:code,text:text});
}
Panel.prototype.login=function(){
	if(this.is_authorized()){
		this.open_panel('main');
		return;
	}
	this.open_panel('login');
}
module.exports=Panel;
