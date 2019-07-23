# Crypto Trade Manager #[LIVE VERSION](https://trader.asiapool.org/register.html)
This app helps you set some watchers on crypto market, in a way that if a coin reachs a price it will be traded automaticly.
[![youtube](https://raw.githubusercontent.com/irhosseinz/Crypto-Trade-Manager/master/html/img/youtube.jpg)](https://www.youtube.com/watch?v=1THmL1ILI4Q)

## Usage
* __Stop Loss__: trade based on your stop-loss strategy 
* __Buy Low__: Buy a Coin in Lowest price you think can reach!
* etc..

## Main features
* __Simple Authentication__: there is simple registeration and login, so app could be used for multiple users
* __Recaptcha Support__: You can get [Recaptcha V3](https://www.google.com/recaptcha/admin) api Keys and enter it in `config.js`, so recaptcha will be used in _background_ on login and register.
* __Add Unlimited API__: you can add unlimited numbers of each supported apis if you have multiple accounts
* __Add Unlimited Trackers__: tracker is used for monitoring market for certain prices and sell or buy when that prices reachs, When a condition occured these actions could be performed:
	* __Market Sell/Buy__: Instant Sell or Buy that coin in any available price
	* __Limit Sell/Buy__: Creates an order in specific price
	* __Cancel a Trade__: Delete an Active Trade
* __Orders History__: you can see your buy and sell history there

## Exchanges
These exchanges are supported:
* __[Bittrex](https://bittrex.com/)__
* __[Binance](https://www.binance.com/)__

## Installation
To use this app you need a system with [Node-JS](https://nodejs.org/en/download/) installed
* in app folder run this command: `npm install`
* start app with `node index.js` (you can use `pm2` for standard usage)
* open your browser and open this url: `https://localhost:1040` (if you are running the app on a server replace `localhost` with your server IP, and open port 1040 on your firewall)
* Register for a account and login

## Coming Features
If you had any opinions to make this project better, please let me know!
> APP IS STILL IN __BETA__ RELEASE, _use it catefully_

## Show your support
Give a ⭐️ if this project helped you!

❤️Donation -> Bitcoin:179CsAFEucLbQG6WDLTxVRX2ax8NBrxcGU
