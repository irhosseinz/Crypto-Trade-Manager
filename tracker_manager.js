var TrackerManager=function(){
	this.trackers={};
	console.log("STARTING TrackerManager at: ("+new Date()+") ");
	this.load_trackers();
	
	global.exchanges={};
	global.exchanges_class={};
	for(var i in global.config.APIS){
		var e=require('./exchanger/'+i+'.js');
		global.exchanges_class[i]=e;
		global.exchanges[i]=new e();
	}
}
TrackerManager.prototype.get_key=function(market,pair){
	return market+'_'+pair;
}
TrackerManager.prototype.notify_user=function(user_id,text){
	global.db.getUserByID(user_id,function(error,uData){
		if(!error && uData){
			global.Telegram.setMessage(uData.tid,text);
		}
	})
}
TrackerManager.prototype.callback=function(track_id,pos_id){
	var self=TrackerManager.prototype;
	global.db.getTrack(track_id,function(error,data){
		if(error){
			console.log('manager getTrack error:'+error);
			return;
		}
		global.db.setTrackStatus(track_id,pos_id,(pos_id==data.track.length));
		if(pos_id<data.track.length){
			console.log('track '+track_id+' is in progress:'+pos_id);
			return;
		}
		if(!data.api_active){
			console.log('api is not active:'+data.api);
			return;
		}
		self.execute_track(data);
	})
}
TrackerManager.prototype.execute_track=function(data){
	var self=this;
	var action=data.action.split('_');
	self.notify_user(data.user,"#"+data.action.toUpperCase().replace('_',' #')+"\n#"+data.pair+" "+JSON.stringify(data.track)+"\n📄"+data.comment);
	if(action[0]=='notify'){
		return;
	}
	var ex=require('./exchanger/'+data.market+'.js');
	var e=new ex(data.api_data);
	if(action[0]=='cancel'){
		e.delete_order(data.action_param,function(error,d){
			if(error){
				console.log("order cancel error: "+JSON.stringify(error));
				self.notify_user(data.user,"#CANCEL_ORDER #ERROR\n#"+data.pair+" "+JSON.stringify(error));
				return;
			}
			// console.log(d);
			self.notify_user(data.user,"#CANCEL_ORDER\n#"+JSON.stringify(d,null,2));
		});
		return;
	}
	var order={
		amount:data.amount
		,market:(action[0]=='market')
		,pair:data.pair
		,buy:(action[1]=='buy')
		,price:data.track[data.track.length-1]
		};
	if(action[0]=='limit')
		order.price=parseFloat(data.action_param);
	e.order(order,function(error,d){
		if(error){
			console.log("order error: "+JSON.stringify(error));
			self.notify_user(data.user,"#ORDER #ERROR\n#"+data.pair+" "+JSON.stringify(error));
			return;
		}
		// console.log(d);
		self.notify_user(data.user,"#ORDER\n#"+JSON.stringify(d,null,2));
		global.db.saveTrade({
			user:data.user
			,symbol:data.pair
			,market:data.market
			,market_id:d.id
			,type:data.action
			,amount:data.amount
			,price:(order.price)
			,date:new Date().getTime()
		});
	});
}
TrackerManager.prototype.start=function(market,pair){
	var key=this.get_key(market,pair);
	if(key in this.trackers){
		return this.trackers[key];
	}
	var t=require('./tracker.js');
	this.trackers[key]=new t(global.exchanges[market],pair,this.callback);
	this.trackers[key].start();
	return this.trackers[key];
}
TrackerManager.prototype.remove_tracker=function(market,pair,id){
	var key=this.get_key(market,pair);
	if(!(key in this.trackers)){
		return true;
	}
	if(this.trackers[key].remove_tracker(id)){
		this.trackers[key].stop();
		delete this.trackers[key];
		console.log("Tracker Stopped: "+pair+" @ "+market);
	}
}
TrackerManager.prototype.add_tracker=function(market,pair,id,track_data,status){
	var t=this.start(market,pair);
	var data=[];
	for(var i in track_data){
		var i2=parseInt(i);
		if(i2<parseInt(status))
			continue;
		data.push({pos_id:i2+1,price:track_data[i]});
	}
	t.add_tracker(id,data);
}
TrackerManager.prototype.load_trackers=function(){
	var self=this;
	global.db.getAllTracks(function(error,rows){
		if(error){
			console.log('error on load all tracks:'+error);
			return;
		}
		for(var i in rows){
			var r=rows[i];
			var t=self.start(r.market,r.pair);
			var data=[];
			for(var j in r.track){
				var i2=parseInt(i);
				if(i2<parseInt(r.status))
					continue;
				data.push({pos_id:i2+1,price:r.track[j]});
			}
			t.add_tracker(r._id,data);
		}
	});
}
module.exports=TrackerManager;
