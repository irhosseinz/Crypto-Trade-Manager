var https = require('https'),
	express = require('express'),
	user = require('./user.js'),
	t=require('./tracker.js');

global.logger=require('./logger.js');
global.config=require('./config.js');
var db=require('./db.js');
global.db=new db();

global.cache = require('./cache.js');
global.cache.start();

global.tools = require('./tools.js');

process.on('SIGINT', function() {
	global.STOP=true;
	trader.stop();
});


var app = express();
app.get('/', function(req, res) {
	res.type('json');
	var os=require('os');
	var o={l:os.loadavg(),c:0};
	for(var i in o.l){
		o.l[i]=Math.floor(o.l[i]*100)/100;
	}
	o.m=Math.floor(100*(os.totalmem()-os.freemem())/os.totalmem());
	res.end(JSON.stringify(o));
});

const fs = require('fs');
const ssl = {
  key: fs.readFileSync(__dirname+'/ssl/ssl.key'),
  cert: fs.readFileSync(__dirname+'/ssl/ssl.cert')
};
https.createServer(ssl,app).listen(global.config.port);
