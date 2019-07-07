var CryptoJS = require("crypto-js");
function Exchange(api){
	this.domain='api.bittrex.com';
	this.name='bittrex';
	this.api=api;
}
Exchange.prototype.summary=function(symbol,callback){
	this.request('/v3/markets/'+symbol+'/summary','GET','',callback);
}
Exchange.prototype.order_book=function(symbol,callback){
	this.request('/v3/markets/'+symbol+'/orderbook','GET','',callback);
}
Exchange.prototype.get_trades=function(symbol,callback){
	this.request('/v3/markets/'+symbol+'/trades','GET','',callback);
}
Exchange.prototype.open_orders=function(callback){
	this.request('/v3/orders/open','GET','',callback);
}
Exchange.prototype.delete_order=function(id,callback){
	this.request('/v3/orders/'+id,'DELETE','',callback);
}
Exchange.prototype.get_order=function(id,callback){
	this.request('/v3/orders/'+id,'GET','',callback);
}
Exchange.prototype.symbol=function(pair){
	if(typeof pair == 'string')
		return pair;
	return pair.join('-');
}
Exchange.prototype.order_market=function(data,callback){
	var d={
		"marketSymbol": data.pair,
		"direction": (data.buy?'BUY':'SELL'),
		"type": "MARKET",
		"quantity": parseFloat(data.amount),
//		"limit": parseFloat(data.price),
		"timeInForce": "GOOD_TIL_CANCELLED"
		};
//   if(data.id){
//   	d.clientOrderId=""+data.id;
//   }
	this.request('/v3/orders','POST',JSON.stringify(d),callback);
}



Exchange.prototype.request=function(uri,method,content,callback){
	const https = require('https');
	var timestamp=new Date().getTime();
	var headers={
			'Api-Timestamp':timestamp
			,'Api-Content-Hash':CryptoJS.SHA512(content).toString(CryptoJS.enc.Hex)
		};
	if(this.api){
		headers['Api-Key']=this.api.key;
		var preSign = [timestamp, 'https://'+this.domain+uri, method, headers['Api-Content-Hash'], ''].join('');
		headers['Api-Signature']=CryptoJS.HmacSHA512(preSign
				, this.api.secret).toString(CryptoJS.enc.Hex);
	}
	if(content)
		headers['Content-Type']='application/json';
	var options = {
		host: this.domain,
		port: 443,
		method: method,
		path: uri
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
			if(callback){
				try{
					var json=JSON.parse(body);
				}catch(e){
					callback(e,body);
					return;
				}
				callback(false,json);
			}
		})
	});

	req.on('error', function(e) {
		console.log('ERROR: ' + e.message);
	});
	
	if(content)
		req.write(content);
	req.end();
}
module.exports=Exchange;
