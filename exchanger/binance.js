var CryptoJS = require("crypto-js");
function Exchange(api){
	this.domain='api.binance.com';
	this.name='binance';
	this.api=api;
}
Exchange.prototype.symbol_list=function(callback){
	this.request('/api/v1/ticker/24hr','GET','',function(error,data){
		if(error){
			callback(error,data);
			return;
		}
		var d=[];
		for(var i in data){
			d.push({symbol:data[i].symbol
					,price:data[i].lastPrice
					,change:data[i].priceChangePercent});
		}
		callback(false,d);
	});
}
Exchange.prototype.get_trades=function(symbol,callback){
	this.request('/api/v1/trades?symbol=symbol','GET','',callback);
}
Exchange.prototype.symbol=function(pair){
	if(typeof pair == 'string')
		return pair;
	return pair.join('');
}
Exchange.prototype.round=function(num,up){
	if(up)
		return Math.ceil(num*1e8)/1e8;
	else
		return Math.floor(num*1e8)/1e8;
}
Exchange.prototype.order_market=function(data,callback){
	var d={
		"symbol": data.pair,
		"side": (data.buy?'BUY':'SELL'),
		"type": "MARKET",
		"quantity": parseFloat(data.amount),
//		"price": this.round(parseFloat(data.price)*(data.buy?2:0.5)),
		"timestamp": new Date().getTime()
		};
	const tf = require('object-to-formdata');
//   if(data.id){
//   	d.clientOrderId=""+data.id;
//   }
	this.request('/api/v3/order','POST',tf(d),callback);
}



Exchange.prototype.request=function(uri,method,content,callback){
	const https = require('https');
	var timestamp=new Date().getTime();
	var headers={};
	if(this.api){
		headers=headers={
			'X-MBX-APIKEY':this.api.key
		};
		headers['Api-Signature']=CryptoJS.HmacSHA512(content
				, this.api.secret).toString(CryptoJS.enc.Hex);
	}
	if(content)
		headers['Content-Type']='application/x-www-form-urlencoded';
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