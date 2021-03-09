module.exports.start=function(){
	global.logins={};
	
	global.cached={};
}
module.exports.set=function(category,name,value){
	global[category][name]=value;
	global.cached[category+"_"+name]=new Date().getTime();
}
module.exports.renew=function(category,name){
	global.cached[category+"_"+name]=new Date().getTime();
}
module.exports.unsetAll=function(category){
	global[category]={};
}
module.exports.unset=function(category,name){
	delete global[category][name];
	delete global.cached[category+"_"+name];
	if(!(category in global)){
		console.log("cache category no exists:"+category);
	}
}
module.exports.isset=function(category,name){
	return (name in global[category]);
}
module.exports.used=function(category,name){
	global.cached[category+"_"+name]=new Date().getTime();
}
module.exports.get=function(category,name){
	if(!(name in global[category]))
		return null;
	global.cached[category+"_"+name]=new Date().getTime();
	return global[category][name];
}
module.exports.clear_user=function(user){
	if(global.cache.isset('user_tokens',user)){
		global.cache.unset('tokens',global.cache.get('user_tokens',user).id);
		global.cache.unset('user_tokens',user);
	}
	if(global.cache.isset('sockets',user)){
		global.cache.get('sockets',user).disconnect();
	}
	global.cache.unset('users',user);
}

