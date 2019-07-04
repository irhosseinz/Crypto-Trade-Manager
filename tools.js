
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
module.exports.randomText=function(size){
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < size; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}
