function DB(){
	var sq=require('sqlite3').verbose();
	var db=new sq.Database('./DB.sqlite3');
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
			+", date integer not null"
			+", data text null"
			+", active integer default 1"
			+")");
		db.run("CREATE TABLE IF NOT EXISTS tracks ("
			+"_id integer primary key autoincrement"
			+", user integer not null"
			+", market text not null"
			+", pair text not null"
			+", date integer not null"
			+", amount real not null"
			+", price real not null"
			+", track text not null"
			+")");
		db.run("CREATE TABLE IF NOT EXISTS apis ("
			+"_id integer primary key autoincrement"
			+", user integer not null"
			+", name text not null"
			+", date integer not null"
			+", data text null"
			+", active integer default 1"
			+")");
		db.run("CREATE TABLE IF NOT EXISTS trades ("
			+"_id integer primary key autoincrement"
			+", symbol text not null"
			+", market text not null"
			+", market_id text null"
			+", type text not null"
			+", price real not null"
			+", amount real not null"
			+", amount_filled real default 0"
			+", status text default 'OPEN'"
			+", date integer not null"
			+", est_end integer null"
			+", end integer null"
			+")");
	});
	this.db=db;
};
DB.prototype.newUser=function(username,password,callback){
	var stmt=this.db.prepare("INSERT INTO users(username,date,password) VALUES (?,?,?)");
	stmt.run(username.toLowerCase(),new Date().getTime(),password,function(err){
				if(err){
					callback(err);
				}else
					callback(false,this.lastID);
			});
	stmt.finalize();
};
DB.prototype.saveApi=function(user,name,data,callback){
	var stmt=this.db.prepare("INSERT INTO apis(name,date,data) VALUES (?,?,?)");
	stmt.run(name,new Date().getTime(),JSON.stringify(data),function(err){
				if(err && callback){
					callback(err);
				}else if(callback)
					callback(false,this.lastID);
			});
	stmt.finalize();
};
DB.prototype.saveTrack=function(data,callback){
	var stmt=this.db.prepare("INSERT INTO tracks(user,market,pair,date,amount,price,track) VALUES (?,?,?,?,?,?,?)");
	stmt.run(data.user,data.market,data.pair,new Date().getTime(),data.amount,data.price,JSON.stringify(data),function(err){
				if(err){
					callback(err);
				}else
					callback(false,this.lastID);
			});
	stmt.finalize();
};
DB.prototype.saveTrade=function(data,callback){
	var stmt=this.db.prepare("INSERT INTO trades(symbol,market,market_id,type,price,amount,date,est_end) VALUES (?,?,?,?,?,?,?,?)");
	stmt.run(data.symbol,data.market,data.market_id?data.market_id:0
			,data.type,data.price,data.amount
			,data.date,data.est_end,function(err){
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
DB.prototype.getApis=function(user,callback){
	this.db.all("SELECT * FROM apis where user=?",[user],function(error,rows){
		if(error){
			callback(error);
//			console.log("DBgetOrders-E:"+error);
			return;
		}
		callback(false,rows);
	});
};
DB.prototype.getTracks=function(user,callback){
	this.db.all("SELECT * FROM tracks where user=?",[user],function(error,rows){
		if(error){
			callback(error);
//			console.log("DBgetOrders-E:"+error);
			return;
		}
		callback(false,rows);
	});
};
DB.prototype.getOrders=function(market,pair,callback){
	this.db.all("SELECT * FROM trades WHERE symbol='"+pair+"' and market='"+market+"' and status='OPEN'",function(error,rows){
		if(error){
			callback(error);
//			console.log("DBgetOrders-E:"+error);
			return;
		}
		callback(false,rows);
	});
};
module.exports=DB;