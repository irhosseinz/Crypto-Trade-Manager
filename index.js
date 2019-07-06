var https = require('https'),
	express = require('express'),
	cookieParser = require('cookie-parser'),
	exphbs = require('express-handlebars'),
	user = require('./user.js'),
	panel = require('./panel.js'),
	t=require('./tracker.js');

global.logger=require('./logger.js');
global.config=require('./config.js');
var db=require('./db.js');
global.db=new db();

global.cache = require('./cache.js');
global.cache.start();

global.tools = require('./tools.js');

//process.on('SIGINT', function() {
//	global.STOP=true;
//});


var app = express();
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', __dirname+'/html/');
var path = require('path');
app.get('/css/:file', function(req, res) {
	res.sendFile(path.join(__dirname + '/html/css/'+req.params.file));
});
app.get('/js/:file', function(req, res) {
	res.sendFile(path.join(__dirname + '/html/js/'+req.params.file));
});
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/html/index.html'));
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
		p.error(500,'65465');return;
	var cookie=(req.cookies?req.cookies.login:null);
	p.authorize(cookie);
	try{
		console.log(req.body);
		p.open_panel(req.params.page,req.body);
	}catch(e){
		p.error(500,e);
		console.log(e);
	}
});

const fs = require('fs');
const ssl = {
  key: fs.readFileSync(__dirname+'/ssl/ssl.key'),
  cert: fs.readFileSync(__dirname+'/ssl/ssl.crt')
};
https.createServer(ssl,app).listen(global.config.port);

console.log('SERVER IS RUNNING ON '+global.config.port);