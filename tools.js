
module.exports.randomNumberSeed=function(seed,from,to){
	var a=Math.sin(seed)*100000;
	a=Math.abs(a-Math.floor(a));
	var d=Math.floor(a*(to-from+1));
	return from+d;
}
module.exports.randomNumber=function(from,to){
	var d=Math.floor(Math.random()*(to-from+1));
	return from+d;
}
module.exports.recaptcha_v3=function(response,callback){
	if(!global.config.recaptcha_v3.active){
		callback(false,true);
		return;
	}
	const https = require('https');
	var options = {
		host: 'www.google.com',
		port: 443,
		method: 'POST',
		path: '/recaptcha/api/siteverify'
		,headers:{'content-type' : 'application/x-www-form-urlencoded'}
	};
	var req = https.request(options, function(res) {
//		console.log('STATUS: ' + res.statusCode);
//		console.log('HEADERS: ' + JSON.stringify(res.headers));
		var bodyChunks = [];
		res.on('data', function(chunk) {
			bodyChunks.push(chunk);
		}).on('end', function() {
			var body = Buffer.concat(bodyChunks);
//			console.log('BODY: ' + body);
			if(callback){
				try{
					var json=JSON.parse(body);
				}catch(e){
					callback(e,body);
					return;
				}
				callback(false,json['success']);
			}
		})
	});

	req.on('error', function(e) {
		console.log('ERROR: ' + e.message);
		callback(e);
	});
	req.write('secret='+encodeURIComponent(global.config.recaptcha_v3.secret)+'&response='+encodeURIComponent(response));
	req.end();
}
module.exports.randomText=function(size){
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < size; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}
