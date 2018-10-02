const path = require('path');

let envfile = process.env.NODE_ENV
if (envfile === undefined) {
	envfile = 'default';
}

require('dotenv').config({
	path: path.resolve(__dirname, `../env/${envfile}.env`)
});

const nunjucks = require('nunjucks');
const express = require('express');

const port = process.env.PORT
const app = express();

// Configures express to use nunjucks as template engine
nunjucks.configure(__dirname, {
	autoescape: true,
	express: app
});


app.get('/', function (req, res) {

	res.render('payment.html');

});


/*
	External
	----------
	Get payment page
		app.get('/payment/:orderid', handler);
	
	Internal
	----------
	Create payment page
		app.post('/payment/:orderid', handler);

	Check payment status
		app.get('/payment/:orderid/status, handler);  

*/


app.listen(port, () => console.log(`Payment service listening on port ${port}!`));
