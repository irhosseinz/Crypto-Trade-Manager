var User=function(){
}
User.prototype.is_authorized=function(){
	return this.logined?true:false;
}
User.prototype.get_cookie=function(){
	if(!this.is_authorized())
		return false;
	var cookie=global.tools.randomText(30);
	global.cache.set('logins',this.logined._id,{cookie:cookie,user:this});
	return this.logined._id+"_"+cookie;
}
User.prototype.set_login=function(data){
	this.logined=data;
	var self=this;
	global.db.getApis(data._id,function(err,d){
		if(err){
			return;
		}
		for(var i in d){
			d[i].api=JSON.stringify({market:d[i].market
					,data:d[i].data});
		}
		self.apis=d;
	});
	global.db.getTracks(data._id,function(err,d){
		if(err){
			return;
		}
		self.tracks=d;
	});
}
User.prototype.register=function(username,password,callback){
	var self=this;
	if(!username || !password){
		callback('Invalid Input');
		return;
	}
	global.db.newUser(username,password,function(err,data){
		if(err){
			if(callback){
				callback(err);
			}
			return;
		}
		self.set_login({username:username,_id:data});
		if(callback)
			callback(false,data);
	});
}
User.prototype.login=function(username,password,callback){
	var self=this;
	global.db.getUser(username,function(err,data){
		if(err){
			if(callback){
				callback(err);
			}
			return;
		}
		if(!data || data.password!==password){
			callback('wrong username or password!');
			return;
		}
		self.set_login(data);
		callback(false,data);
	})
}
User.prototype.add_api=function(name,market,data,callback){
	var self=this;
	global.db.saveApi(self.logined._id,market,name,data,function(err,id){
		if(err){
			if(callback){
				callback(err);
			}
			return;
		}
		if(callback)
			callback(false,id);
		self.apis.push({_id:id,name:name,market:market,data:data
			,api:JSON.stringify({market:market,data:data})
			});
	})
}
User.prototype.delete_api=function(id){
	var self=this;
	global.db.deleteApi(id,self.logined._id);
	for(var i in this.apis){
		if(this.apis[i]._id==id){
			this.apis.splice(i,1);
			break;
		}
	}
}
User.prototype.delete_track=function(id){
	var self=this;
	global.db.deleteTrack(id,self.logined._id);
	for(var i in this.tracks){
		if(this.tracks[i]._id==id){
			this.tracks.splice(i,1);
			break;
		}
	}
}
User.prototype.add_tracker=function(data,callback){
	var self=this;
	data.user=self.logined._id;
	data.date=new Date().getTime();
	global.db.saveTrack(data,function(err,id){
		if(err){
			if(callback){
				callback(err);
			}
			return;
		}
		if(callback)
			callback(false,id);
		data._id=id;
		self.tracks.push(data);
	});
}
User.prototype.get_orders=function(callback){
	global.db.getOrders(this.logined._id,callback);
}
module.exports=User;
