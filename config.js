module.exports.APIS={
	bittrex:{
		name:'Bittrex'
		,keys:['key','secret']
	}
	,binance:{
		name:'Binance'
		,keys:['key','secret']
	}
};

//module.exports.db={
//	type:'mysql'
//	,data:{
//		host     : 'localhost',
//		user     : 'me',
//		password : 'secret',
//		database : 'my_db'
//		}
//};
module.exports.db={
	type:'sqlite'
	,data:{
		database : 'DB'
		}
};
module.exports.https=false;


module.exports.title='Trade Manager';


module.exports.cookie_life=900000;

module.exports.port=1040;

module.exports.cycle_second=10;
module.exports.cycle_second=10;//run every second
module.exports.wait_after_jump=30;//wait after prices levels changes then decide

