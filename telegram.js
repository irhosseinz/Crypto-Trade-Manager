function Telegram(bot_id){
	this.bot_id=bot_id;
}
Telegram.prototype.setWebhook=function(url){
    return this.request('setWebhook',{url:url});
}
Telegram.prototype.setMessage=function(to,text){
    return this.request('sendMessage',{chat_id:to,text:text});
}
Telegram.prototype.getStatus=function(to,text){
    return this.request('getwebhookInfo',{});
}
Telegram.prototype.request=function(method,content){
    return new Promise((success,fail)=>{
        const https = require('https');
        var options = {
            host: 'api.telegram.org',
            port: 443,
            method: 'POST',
            path: '/bot' + this.bot_id + '/' + method,
            headers:{'Content-Type':'application/json'}
        };
        var req = https.request(options, function(res) {
            var bodyChunks = [];
            res.on('data', function(chunk) {
                bodyChunks.push(chunk);
            }).on('end', function() {
                var body = Buffer.concat(bodyChunks);
                // console.log('telegram resp: ' + body);
                try{
                    var json=JSON.parse(body);
                    success(json);
                }catch(e){
                    fail(e);
                }
            })
        });

        req.on('error', function(e) {
            console.log('ERROR: ' + e.message);
            fail(e.message);
        });
        
        req.write(JSON.stringify(content));
        req.end();
    });
}
module.exports=Telegram;
