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

module.exports.db={
	type:'mysql'
	,data:{
		host     : 'localhost',
		user     : 'uuu',
		password : 'ppp',
		database : 'db'
		}
};
//module.exports.db={
//	type:'sqlite'
//	,data:{
//		database : 'DB'
//		}
//};
module.exports.https=false;


module.exports.title='Trade Manager';
module.exports.url='https://trader.sinbad.vip';


module.exports.recaptcha_v3={
	active:true//you can activate or deactivate recaptcha here
	,key:''
	,secret:''
};

module.exports.telegram_bot={
	username:'',
	api_key:'',
	webhook:'/telegramBot_(randomtext)'//add a random string at the end of this address for security of the bot 
};

module.exports.cookie_life=900000;

module.exports.port=1040;

module.exports.cycle_second=10;
module.exports.cycle_second=10;//run every second
module.exports.wait_after_jump=30;//wait after prices levels changes then decide

