function formatPrice(v,d) {
	return parseFloat(v).toFixed((typeof d == 'number')?d:4).replace(/\.?0+$/,'');
}
function exchange_balance(api){
	$('#modal_action').attr("disabled", true);
	$('#modal_title').text('Your Balances');
	$('#modal_body').text('getting data. please wait..');
	$('#modal').modal();
	if(typeof api == 'object')
		api=JSON.stringify(api);
	$.post("exchanger.html",'balances='+encodeURIComponent(api),function( result ) {
		if(!result.ok){
			$('#modal_body').text('ERROR:'+result.error);
			return;
		}
		var data=result.result;
		var html='<table class="table table-striped"><thead><tr><th scope="col">Symbol</th><th scope="col">Avaiable</th><th scope="col">Total</th><th scope="col">Price</th></tr></thead><tbody>';
		for(var i in data){
			html+='<tr><th scope="row">'+data[i].symbol+'</th><td>'+formatPrice(data[i].available)+'</td><td>'+formatPrice(data[i].total);
			if(data[i].price)
				html+='<br/><b>'+formatPrice(data[i].total*data[i].price.price,0)+' '+data[i].price.capital+'</b>';
			html+='</td><td>';
			if(data[i].price)
				html+=formatPrice(data[i].price.price,0)+'<br/><span class="text-'+(data[i].price.change>0?'success':'danger')+'">'+formatPrice(data[i].price.change,2)+'%</span>';
			html+='</td></tr>';
		}
		html+='</tbody></table>';
		$('#modal_body').html(html);
	},'json');
}
function exchange_orders(api,callback){
	$('#modal_action').attr("disabled", true);
	$('#modal_title').text('Your Open Trades');
	$('#modal_body').text('getting data. please wait..');
	$('#modal').modal();
	if(typeof api == 'object')
		api=JSON.stringify(api);
	$.post("exchanger.html",'orders='+encodeURIComponent(api),function( result ) {
		if(!result.ok){
			$('#modal_body').text('ERROR:'+result.error);
			return;
		}
		var data=result.result;
		$('#modal_body').html('<table class="table table-striped"><thead><tr><th scope="col">Symbol</th><th scope="col">Price</th><th scope="col">Quantity</th><th scope="col">Market</th>'+(callback?'<th scope="col"></th>':'')+'</tr></thead><tbody></tbody></table>');
		for(let i in data){
			let title=(data[i].buy?'BUY':'SELL')+" "+data[i].symbol+" @ "+formatPrice(data[i].price);
			var tr=$('<tr>',{class:'table-'+(data[i].buy?'success':'danger')});
			tr.append('<th scope="row">'+data[i].symbol+'</th><td>'+formatPrice(data[i].price)+'</td><td>'+formatPrice(data[i].amount)+(data[i].filled?' (-'+formatPrice(data[i].filled)+')':'')+'<br/><b>Total: '+formatPrice(data[i].amount*data[i].price)+'</b>'+'</td>');
			if(data[i].market){
				tr.append('<td>'+formatPrice(data[i].market.price)+'<br/><span class="text-'+(data[i].market.change>0?'success':'danger')+'">'+formatPrice(data[i].market.change,2)+'%</span></td>');
			}else{
				tr.append('<td></td>');
			}
			if(callback){
				var a=$('<a>',{class:'btn btn-info m-1'});
				a.html('<span data-feather="crosshair" color="#ffffff" stroke-width="3"></span>');
				a.click(function(){
					callback(data[i].id,title);
					$('#modal').modal('toggle');
				});
				tr.append($('<td>').html(a));
			}
			$('#modal_body table tbody').append(tr);
		}
		feather.replace()
	},'json');
}
