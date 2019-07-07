module.exports.log=function(text,level){
	const https = require('https');
	var timestamp=new Date();
	var headers={
			'Content-Type':'application/json'
		};
	var options = {
		host: 'api.telegram.org',
		port: 443,
		method: 'POST',
		path: '/bot111/sendMessage'
		,headers:headers
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
		})
	});

	req.on('error', function(e) {
		console.log('ERROR: ' + e.message);
	});
	
	req.write(JSON.stringify({chat_id:'181547702','text':text}));
	req.end();
};
