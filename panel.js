var Panel=function(req,res){
	this.req=req;
	this.res=res;
}
Panel.prototype.is_authorized=function(){
	return (this.user && this.user.is_authorized())?true:false;
}
Panel.prototype.logout=function(){
	delete this.user;
	this.res.cookie('login','',{ maxAge: -1, httpOnly: true });
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
	var user = require('./user.js');
	this.user=new user();
	this.user.register(username,password,callback);
}
Panel.prototype.login=function(username,password,callback){
	var user = require('./user.js');
	this.user=new user();
	this.user.login(username,password,callback);
}
Panel.prototype.open_panel=function(page,data){
	var path = require('path');
	var self=this;
	var pData={title:global.config.title,page:page};
	switch(page){
		case 'login':
			pData.title2='Login';
			if('logout' in this.req.query){
				this.logout();
			}else if(this.is_authorized()){
				this.open_panel('panel');
				break;
			}
			if(data){
				this.login(data.username,data.password,function(error,d){
					if(error){
						pData.error=error;
						self.res.render('login',pData);
						return;
					}
					self.res.cookie('login',self.get_cookie(),{ maxAge: global.config.cookie_life, httpOnly: true });
					self.res.redirect('panel.html');
				});
			}else
				this.res.render('login',pData);
			break;
		case 'register':
			pData.title2='Register';
			if(this.is_authorized()){
				this.open_panel('panel');
				break;
			}
			if(data){
				this.register(data.username,data.password,function(error,d){
					if(error){
						pData.error=error;
						self.res.render('register',pData);
						return;
					}
					self.res.cookie('login',self.get_cookie(),{ maxAge: global.config.cookie_life, httpOnly: true });
					self.res.redirect('panel.html');
				});
			}else
				this.res.render('register',pData);
			break;
		case 'panel':
			pData.title2='Panel';
			pData.layout='panel';
			if(!this.is_authorized()){
				this.res.redirect('login.html');
				break;
			}
			pData.apis=[];
			for(var i in this.user.apis){
				var a=this.user.apis[i];
				pData.apis.push({_id:a._id+"_"+a.market,name:a.name+" ("+a.market+")"});
			}
			if(data && data.api){
				var api=data.api.split('_'),a=global.config.APIS[data.exchanger];
				var d={
					api:api[0]
					,market:api[1]
					,pair:data.pair
					,amount:data.amount
					,track:[parseFloat(data.price)]
					,action:(data.buy?'BUY':'SELL')
				};
				this.user.add_tracker(d,function(error,id){
					pData.list=self.user.tracks;
					if(error){
						pData.error=error;
						self.res.render('panel',pData);
					}else{
						self.res.render('panel',pData);
					}
					global.manager.add_tracker(d.market,d.pair,id,d.track,0);
				});
				return;
			}else if(data && data.remove){
				global.manager.remove_tracker(data.market,data.pair,data.remove);
				this.user.delete_track(data.remove);
				this.res.end('ok');
				return;
			}
			pData.list=this.user.tracks;
			this.res.render('panel',pData);
			break;
		case 'exchanger':
			pData.title2='Exchanger';
			pData.layout='panel';
			if(!this.is_authorized()){
				this.res.redirect('login.html');
				break;
			}
			if(data && (data.exchanger in global.config.APIS)){
				var d={},a=global.config.APIS[data.exchanger];
				for(var i in a.keys){
					d[a.keys[i]]=data[data.exchanger+'_'+i];
				}
				this.user.add_api(data.name,data.exchanger,d,function(error,id){
					if(error){
						pData.error=error;
						self.res.render('exchanger',pData);
					}else{
						self.open_panel('exchanger');
					}
				});
				return;
			}else if(data && data.remove){
				this.user.delete_api(data.remove);
				this.res.end('ok');
				return;
			}
			pData.list=this.user.apis;
			pData.apis=[];
			pData.inputs=[];
			for(var i in global.config.APIS){
				var a=global.config.APIS[i];
				pData.apis.push({name:a.name,key:i});
				for(var j in a.keys){
					pData.inputs.push({key:i,name:i+'_'+j,title:a.keys[j]});
				}
			}
			this.res.render('exchanger',pData);
			break;
		case 'trades':
			pData.title2='Trades';
			pData.layout='panel';
			if(!this.is_authorized()){
				this.res.redirect('login.html');
				break;
			}
			this.user.get_orders(function(err,data){
				if(err){
					pData.error=err;
					self.res.render('trades',pData);
					return;
				}
				pData.list=data;
				self.res.render('trades',pData);
			});
			break;
		case 'exist':
			self.res.type('text');
			global.db.getUser(this.req.query.username,function(err,d){
				if(err || !d || d.length==0){
					self.res.end('true');
					return;
				}
				self.res.end('false');
			})
			break;
		default:
			this.res.sendFile(path.join(__dirname + '/html/index.html'));
			break;
	}
}
Panel.prototype.error=function(code,text){
	this.res.render('error',{code:code,text:text});
}
module.exports=Panel;
