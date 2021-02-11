// dont change this
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

//place your database info here
module.exports.db={
	type:'mysql'
	,data:{
		host     : 'localhost',
		user     : 'uuu',
		password : 'ppp',
		database : 'db'
		}
};

//optional usage if sqlite instead of mysql
//module.exports.db={
//	type:'sqlite'
//	,data:{
//		database : 'DB'
//		}
//};

//run app with activated ssl. (You Need ssl for telegram bot to work, but you can turn this off and use cloudflare flexible ssl tool to activate ssl in that way)
module.exports.https=false;

//title of the website in browser
module.exports.title='Trade Manager';

//url of the website
module.exports.url='https://trader.sinbad.vip';


module.exports.recaptcha_v3={
	active:false//you can activate or deactivate recaptcha here
	,key:''
	,secret:''
};

//place your telegram bot details in here
module.exports.telegram_bot={
	username:'',
	api_key:'',
	webhook:'/telegramBot_(randomtext)'//add a random string at the end of this address for security of the bot 
};

//15 minutes = 15*60*1000
module.exports.cookie_life=900000;

module.exports.port=1040;

//the app'll check for events every 10 seconds by default
module.exports.cycle_second=10;

