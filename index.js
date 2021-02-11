var https = require('https'),
	http = require('http'),
	express = require('express'),
	cookieParser = require('cookie-parser'),
	exphbs = require('express-handlebars'),
	user = require('./user.js'),
	panel = require('./panel.js'),
	t=require('./tracker.js'),
	tel=require('./telegram.js');
var bodyParser = require('body-parser')

global.logger=require('./logger.js');
global.config=require('./config.js');
global.Telegram=new tel(global.config.telegram_bot.api_key);
var db=require('./db_'+global.config.db.type+'.js');
global.db=new db();

global.cache = require('./cache.js');
global.cache.start();

var m=require('./tracker_manager.js');
global.manager = new m();
global.tools = require('./tools.js');

//process.on('SIGINT', function() {
//	global.STOP=true;
//});


var app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var hbs = exphbs.create({
	helpers: {
		ifEqual: function(v1, v2, options) {
					if(v1 === v2) {
						return options.fn(this);
					}
						return options.inverse(this);
					}
		,formatPrice: function(v) {
						return parseFloat(v).toFixed(12).replace(/\.?0+$/,'');
					}
		,date: function(t) {
						var d=new Date(parseInt(t));
						return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
					}
	}
});
app.use(express.urlencoded({extended:true}));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', __dirname+'/html/');

var path = require('path');
const Telegram = require('./telegram.js');
app.get('/css/:file', function(req, res) {
	res.sendFile(path.join(__dirname + '/html/css/'+req.params.file));
});
app.get('/js/:file', function(req, res) {
	res.sendFile(path.join(__dirname + '/html/js/'+req.params.file));
});
app.get('/img/:file', function(req, res) {
	res.sendFile(path.join(__dirname + '/html/img/'+req.params.file));
});
app.get('/', function(req, res) {
	var p=new panel(req,res);
	try{
		var cookie=(req.cookies?req.cookies.login:null);
		p.authorize(cookie);
		p.open_panel('');
	}catch(e){
		p.error(500,e);
		console.log(e);
	}
});
app.get('/:page.html', function(req, res) {
	var p=new panel(req,res);
	try{
		var cookie=(req.cookies?req.cookies.login:null);
		p.authorize(cookie);
		p.open_panel(req.params.page);
	}catch(e){
		p.error(500,e);
		console.log(e);
	}
});
app.post('/:page.html', function(req, res) {
	var p=new panel(req,res);
	var cookie=(req.cookies?req.cookies.login:null);
	p.authorize(cookie);
	try{
//		console.log(req.body);
		p.open_panel(req.params.page,req.body);
	}catch(e){
		p.error(500,e);
		console.log(e);
	}
});
global.Telegram.setWebhook(global.config.url+global.config.telegram_bot.webhook);
app.post(global.config.telegram_bot.webhook, function(req, res) {
	var body=req.body;
	if(!body.message){
		return;
	}
	res.set('Content-Type', 'application/json');
	var msg={method:'sendMessage',chat_id:body.message.from.id,text:"Nothing To Do!"};
	if(body.message && body.message.text && body.message.text.substr(0,6)=='/start'){
		var data=body.message.text.split(' ');
		if(data.length>1){
			global.db.set_telegram_id(data[1],body.message.from.id);
			msg.text="The Bot Has Activated on Your Account!";
		}
	}
	res.end(JSON.stringify(msg));
});

if(global.config.https){
	const fs = require('fs');
	const ssl = {
	  key: fs.readFileSync(__dirname+'/ssl/ssl.key'),
	  cert: fs.readFileSync(__dirname+'/ssl/ssl.crt')
	};
	https.createServer(ssl,app).listen(global.config.port);
}else{
	http.createServer(app).listen(global.config.port);
}

console.log('SERVER IS RUNNING ON '+global.config.port);
