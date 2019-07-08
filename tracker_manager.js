var Tracker=function(){
	this.trackers={};
	console.log("STARTING TrackerManager at: ("+new Date()+") ");
	this.load_trackers();
}
Tracker.prototype.get_key=function(market,pair){
	return market+'_'+pair;
}
Tracker.prototype.callback=function(track_id,pos_id){
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
		var ex=require('./exchanger/'+data.market+'.js');
		var e=new ex(data.api_data);
		e.order_market({amount:data.amount,pair:data.pair,buy:(data.action=='BUY'),price:data.track[data.track.length-1]},function(error,d){
			console.log(d);
			global.db.saveTrade({
				user:data.user
				,symbol:data.pair
				,market:data.market
				,market_id:d.id
				,type:data.action
				,amount:data.amount
				,date:new Date().getTime()
			});
		});
	})
}
Tracker.prototype.start=function(market,pair){
	var key=this.get_key(market,pair);
	if(key in this.trackers){
		return this.trackers[key];
	}
	var t=require('./tracker.js');
	this.trackers[key]=new t(market,pair,this.callback);
	this.trackers[key].start();
	return this.trackers[key];
}
Tracker.prototype.remove_tracker=function(market,pair,id){
	var key=this.get_key(market,pair);
	if(!(key in this.trackers)){
		return true;
	}
	if(this.trackers[key].remove_tracker(id)){
		delete this.trackers[key];
	}
}
Tracker.prototype.add_tracker=function(market,pair,id,track_data,status){
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
Tracker.prototype.load_trackers=function(){
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
module.exports=Tracker;
