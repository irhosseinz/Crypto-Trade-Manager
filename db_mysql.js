function DB(){
	var mysql      = require('mysql');
	var db = mysql.createConnection(global.config.db.data);

	db.connect(function(err){
		if(err){
			console.log('DB ERROR: '+err);
			return;
		}
		console.log('DB CONNECTED');
//		db.run("DELETE FROM trades");
		
		db.query("CREATE TABLE IF NOT EXISTS `users` ("
			  +"`_id` int(11) NOT NULL AUTO_INCREMENT,"
			  +"`username` varchar(50) DEFAULT NULL,"
			  +"`password` varchar(255) NOT NULL,"
			  +"`secret` varchar(50) DEFAULT NULL,"
			  +"`tid` varchar(50) DEFAULT NULL,"
			  +"`date` bigint(15),"
			  +"PRIMARY KEY (`_id`),"
			  +"UNIQUE KEY `username` (`username`)"
			+") ENGINE=InnoDB DEFAULT CHARSET=utf8");
		db.query("CREATE TABLE IF NOT EXISTS apis ("
				+"`_id` int(11) NOT NULL AUTO_INCREMENT"
				+", user int(11) not null"
				+", name varchar(20) not null"
				+", market varchar(20) not null"
				+", date bigint(15)"
				+", data varchar(255) null"
				+", active int(1) default 1"
				+",PRIMARY KEY (`_id`)"
			  +", KEY `user` (`user`)"
			+") ENGINE=InnoDB DEFAULT CHARSET=utf8");
		db.query("CREATE TABLE IF NOT EXISTS tracks ("
			  +"`_id` int(11) NOT NULL AUTO_INCREMENT"
			+", user int(11) not null"
			+", api int(11) not null"
			+", market varchar(20) not null"
			+", pair varchar(20) not null"
			+", date bigint(15)"
			+", amount varchar(50) not null"
			+", track varchar(255) not null"
			+", action varchar(30) not null"
			+", action_param varchar(50) null"
			+", status int(2) default 0"
			+", active int(2) default 1"
			  +",PRIMARY KEY (`_id`)"
			  +", KEY `user` (`user`,`active`)"
			+") ENGINE=InnoDB DEFAULT CHARSET=utf8");
		db.query("CREATE TABLE IF NOT EXISTS trades ("
			  +"`_id` int(11) NOT NULL AUTO_INCREMENT"
			+", user int(11) not null"
			+", symbol varchar(20) not null"
			+", market varchar(20) not null"
			+", market_id varchar(60) null"
			+", type varchar(20) not null"
			+", amount varchar(50) not null"
			+", price varchar(50) null"
			+", date bigint(15)"
			  +",PRIMARY KEY (`_id`)"
			+") ENGINE=InnoDB DEFAULT CHARSET=utf8");
	});
	this.db=db;
};
DB.prototype.newUser=function(username,password,callback){
	var secret=global.tools.randomText(10);
	this.db.query("INSERT INTO users(username,date,password,secret) VALUES (?,?,?,?)"
		,[username.toLowerCase(),new Date().getTime(),password,secret]
		,function(err,result){
				if(err){
					if(err.errno==1062){
						callback('Username already registered');
					}else if(callback)
						callback(err);
					console.log(err);
				}else if(callback){
					var d={_id:result.insertId,username:username,secret:secret};
					callback(false,d);
				}
			});
};
DB.prototype.getUserByID=function(id,callback){
	this.db.query("SELECT * FROM users where _id=?",[id],function(error,rows){
		if(error){
			callback(error);
			return;
		}
		callback(false,rows[0]);
	});
};
DB.prototype.set_telegram_id=function(secret,tid){
	var data=secret.split("_");
	if(data.length<2){
		return;
	}
	this.db.query("UPDATE users SET tid=? WHERE _id=? and secret=?",[tid+"",parseInt(data[0]),data[1]]);
};
DB.prototype.saveApi=function(user,market,name,data,callback){
	this.db.query("INSERT INTO apis(user,name,market,date,data) VALUES (?,?,?,?,?)"
		,[user,name,market,new Date().getTime(),JSON.stringify(data)]
		,function(err,result){
				if(err){
					if(callback)
						callback(err);
					console.log(err);
				}else if(callback)
					callback(false,result.insertId);
			});
};
DB.prototype.saveTrack=function(data,callback){
	this.db.query("INSERT INTO tracks(user,api,market,pair,date,amount,track,action,action_param) VALUES (?,?,?,?,?,?,?,?,?)"
		,[data.user,data.api,data.market,data.pair,new Date().getTime(),data.amount,JSON.stringify(data.track),data.action,data.action_price]
		,function(err,result){
				if(err){
					if(callback)
						callback(err);
					console.log(err);
				}else if(callback)
					callback(false,result.insertId);
			});
};
DB.prototype.saveTrade=function(data,callback){
	this.db.query("INSERT INTO trades(user,symbol,market,market_id,type,amount,price,date) VALUES (?,?,?,?,?,?,?,?)"
		,[data.user,data.symbol,data.market,data.market_id
			,data.type,data.amount,data.price
			,data.date]
		,function(err,result){
				if(err){
					if(callback)
						callback(err);
					console.log(err);
				}else if(callback)
					callback(false,result.insertId);
			});
};
DB.prototype.setTradeID=function(id,market_id){
	this.db.query("UPDATE trades SET market_id=? WHERE _id=?",[market_id,id]);
};
DB.prototype.deleteApi=function(id,user){
	this.db.query("DELETE from apis WHERE _id=? and user=?",[id,user]);
};
DB.prototype.deleteTrack=function(id,user){
	this.db.query("DELETE from tracks WHERE _id=? and user=?",[id,user]);
};
DB.prototype.setTrackStatus=function(id,status,finish){
	var active=(finish?0:1);
	this.db.query("UPDATE tracks SET status=?,active=? WHERE _id=?",[status,active,id]);
};
DB.prototype.getUser=function(username,callback){
	this.db.query("SELECT * FROM users where username=?",[username],function(error,rows){
		if(error){
			callback(error);
//			console.log("DBgetOrders-E:"+error);
			return;
		}
		callback(false,rows[0]);
	});
};
DB.prototype.getTrack=function(id,callback){
	this.db.query("SELECT tracks.*,apis.data as api_data,apis.active as api_active FROM tracks INNER JOIN apis ON tracks.api=apis._id where tracks._id=?",[id],function(error,rows){
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
	this.db.query("SELECT * FROM apis where user=?",[user],function(error,rows){
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
	this.db.query("SELECT * FROM tracks where user=? and active=1",[user],function(error,rows){
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
	this.db.query("SELECT * FROM tracks where active=1",function(error,rows){
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
	this.db.query("SELECT * FROM trades WHERE user=? order by date desc",[user],function(error,rows){
		if(error){
			callback(error);
//			console.log("DBgetOrders-E:"+error);
			return;
		}
		callback(false,rows);
	});
};
module.exports=DB;
