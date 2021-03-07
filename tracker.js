var Tracker=function(exchanger,pair,callback){
	this.exchanger=exchanger;
	this.pair=this.exchanger.symbol(pair);
	this.pair_name=pair;
	
	console.log("STARTING Tracker at: ("+new Date()+") "+JSON.stringify(pair)+" @ "+exchanger);
	
	this.tracks={};
	this.callback=callback;
}
Tracker.prototype.start=function(){
	var self=this;
	this.interval=setInterval(function(){
		self.get_prices(function(error,data){
			if(error){
				console.log('error on order book0:'+error);
				return;
			}
			// console.log(data);
			self.check_tracks(data);
		});
	},global.config.cycle_second*1000);
}
Tracker.prototype.stop=function(){
	clearInterval(this.interval);
}
Tracker.prototype.remove_tracker=function(id){
	delete this.tracks[id];
	if(Object.keys(this.tracks).length==0){
		clearInterval(this.interval);
		return true;
	}
	return false;
}
Tracker.prototype.add_tracker=function(id,data){
	this.tracks[id]=data;//{track:[{price:5,pos_id:1}]}
}
Tracker.prototype.check_tracks=function(data){
	for(var i in data){
		var price=parseFloat(data[i].rate);
		if(!this.lastPrice){
			this.lastPrice=price;
			continue;
		}
		for(var j in this.tracks){
			var t=this.tracks[j][0];
			if(!t){
				continue;
			}
			if(t.price==='now' || (this.lastPrice<t.price && t.price<=price) || (price<=t.price && t.price<this.lastPrice)){
				console.log('position reached:'+JSON.stringify(t));
				this.tracks[j].shift();
				if(this.tracks[j].length==0){
					delete this.tracks[j];
				}
				this.callback(j,t.pos_id);
			}else{
				// console.log("tracking  "+this.lastPrice+" -> "+price+" -> "+t.price)
			}
		}
		this.lastPrice=price;
	}
}
Tracker.prototype.get_prices=function(callback){
	this.exchanger.get_trades(this.pair,callback);
}
module.exports=Tracker;
