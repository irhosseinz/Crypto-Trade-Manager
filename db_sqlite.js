function DB(){
	var sq=require('sqlite3').verbose();
	var db=new sq.Database('./'+global.config.db.data.database+'.sqlite3');
	db.serialize(function(){
		console.log('DB CONNECTED');
//		db.run("DELETE FROM trades");
		
		db.run("CREATE TABLE IF NOT EXISTS users ("
			+"_id integer primary key autoincrement"
			+", username integer not null UNIQUE"
			+", date integer not null"
			+", password text not null"
			+")");
		db.run("CREATE TABLE IF NOT EXISTS apis ("
			+"_id integer primary key autoincrement"
			+", user integer not null"
			+", name text not null"
			+", market text not null"
			+", date integer not null"
			+", data text null"
			+", active integer default 1"
			+")");
		db.run("CREATE INDEX IF NOT EXISTS apis_user ON apis(user)");
		db.run("CREATE TABLE IF NOT EXISTS tracks ("
			+"_id integer primary key autoincrement"
			+", user integer not null"
			+", api integer not null"
			+", market text not null"
			+", pair text not null"
			+", date integer not null"
			+", amount real not null"
			+", track text not null"
			+", action text not null"
			+", action_price text null"
			+", status integer default 0"
			+", active integer default 1"
			+")");
		db.run("CREATE INDEX IF NOT EXISTS tracks_user ON tracks(user,active)");
		db.run("CREATE TABLE IF NOT EXISTS trades ("
			+"_id integer primary key autoincrement"
			+", user integer not null"
			+", symbol text not null"
			+", market text not null"
			+", market_id text null"
			+", type text not null"
			+", amount real not null"
			+", price real null"
			+", date integer not null"
			+")");
	});
	this.db=db;
};
DB.prototype.newUser=function(username,password,callback){
	var stmt=this.db.prepare("INSERT INTO users(username,date,password) VALUES (?,?,?)");
	stmt.run(username.toLowerCase(),new Date().getTime(),password,function(err){
				if(err){
					callback(err);
					console.log(err);
				}else
					callback(false,this.lastID);
			});
	stmt.finalize();
};
DB.prototype.saveApi=function(user,market,name,data,callback){
	var stmt=this.db.prepare("INSERT INTO apis(user,name,market,date,data) VALUES (?,?,?,?,?)");
	stmt.run(user,name,market,new Date().getTime(),JSON.stringify(data),function(err){
				if(err && callback){
					callback(err);
				}else if(callback)
					callback(false,this.lastID);
			});
	stmt.finalize();
};
DB.prototype.saveTrack=function(data,callback){
	var stmt=this.db.prepare("INSERT INTO tracks(user,api,market,pair,date,amount,track,action,action_price) VALUES (?,?,?,?,?,?,?,?,?)");
	stmt.run(data.user,data.api,data.market,data.pair,new Date().getTime(),data.amount,JSON.stringify(data.track),data.action,data.action_price,function(err){
				if(err){
					callback(err);
				}else
					callback(false,this.lastID);
			});
	stmt.finalize();
};
DB.prototype.saveTrade=function(data,callback){
	var stmt=this.db.prepare("INSERT INTO trades(user,symbol,market,market_id,type,amount,price,date) VALUES (?,?,?,?,?,?,?,?)");
	stmt.run(data.user,data.symbol,data.market,data.market_id
			,data.type,data.amount,data.price
			,data.date,function(err){
				if(err && callback){
					callback(err);
				}else if(callback)
					callback(false,this.lastID);
			});
	stmt.finalize();
};
DB.prototype.setTradeID=function(id,market_id){
	this.db.run("UPDATE trades SET market_id=? WHERE _id=?",[market_id,id]);
};
DB.prototype.deleteApi=function(id,user){
	this.db.run("DELETE from apis WHERE _id=? and user=?",[id,user]);
};
DB.prototype.deleteTrack=function(id,user){
	this.db.run("DELETE from tracks WHERE _id=? and user=?",[id,user]);
};
DB.prototype.setTrackStatus=function(id,status,finish){
	var active=(finish?0:1);
	this.db.run("UPDATE tracks SET status=?,active=? WHERE _id=?",[status,active,id]);
};
DB.prototype.getUser=function(username,callback){
	this.db.all("SELECT * FROM users where username=?",[username],function(error,rows){
		if(error){
			callback(error);
//			console.log("DBgetOrders-E:"+error);
			return;
		}
		callback(false,rows[0]);
	});
};
DB.prototype.getTrack=function(id,callback){
	this.db.all("SELECT tracks.*,apis.data as api_data,apis.active as api_active FROM tracks INNER JOIN apis ON tracks.api=apis._id where tracks._id=?",[id],function(error,rows){
		if(error){
			callback(error);
//			console.log("DBgetOrders-E:"+error);
			return;
		}
		var o=rows[0];
		try{
			o.track=JSON.parse(o.track);
			o.api_data=JSON.parse(o.api_data);
		}catch(e){
			o.track=[];
			o.api_data={};
		}
		callback(false,o);
	});
};
DB.prototype.getApis=function(user,callback){
	this.db.all("SELECT * FROM apis where user=?",[user],function(error,rows){
		if(error){
			callback(error);
//			console.log("DBgetOrders-E:"+error);
			return;
		}
		for(var i in rows){
			try{
				rows[i].data=JSON.parse(rows[i].data);
			}catch(e){
				rows[i].data=[];
			}
		}
		callback(false,rows);
	});
};
DB.prototype.getTracks=function(user,callback){
	this.db.all("SELECT * FROM tracks where user=? and active=1",[user],function(error,rows){
		if(error){
			callback(error);
//			console.log("DBgetOrders-E:"+error);
			return;
		}
		for(var i in rows){
			try{
				rows[i].track=JSON.parse(rows[i].track);
			}catch(e){
				rows[i].track=[];
			}
		}
		callback(false,rows);
	});
};
DB.prototype.getAllTracks=function(callback){
	this.db.all("SELECT * FROM tracks where active=1",function(error,rows){
		if(error){
			callback(error);
//			console.log("DBgetOrders-E:"+error);
			return;
		}
		for(var i in rows){
			try{
				rows[i].track=JSON.parse(rows[i].track);
			}catch(e){
				rows[i].track=[];
			}
		}
		callback(false,rows);
	});
};
DB.prototype.getOrders=function(user,callback){
	this.db.all("SELECT * FROM trades WHERE user=? order by date desc",[user],function(error,rows){
		if(error){
			callback(error);
//			console.log("DBgetOrders-E:"+error);
			return;
		}
		callback(false,rows);
	});
};
module.exports=DB;
