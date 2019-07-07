var Tracker=function(){
	this.trackers={};
	console.log("STARTING TrackerManager at: ("+new Date()+") ");
}
Tracker.prototype.get_key=function(market,pair){
	return market+'_'+pair;
}
Tracker.prototype.callback=function(track_id,pos_id){
	global.db.getTrack(track_id,function(error,data){
		if(error){
			return;
		}
		global.db.setTrackStatus(track_id,pos_id);
		if(pos_id<data.track.length){
			return;
		}
		if(!data.api_active){
			console.log('api is not active:'+data.api);
			return;
		}
		var ex=require('./exchanger/'+data.market+'.js');
		var e=new ex(data.api_data);
		e.order_market({amount:data.amount,pair:data.pair,buy:(data.action=='BUY')},function(error,d){
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
		if(i<status)
			continue;
		data.push({pos_id:i+1,price:track_data[i]});
	}
	t.add_tracker(id,data);
}
module.exports=Tracker;
