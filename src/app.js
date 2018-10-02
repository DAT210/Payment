const path = require('path');
const nunjucks = require('nunjucks');
const express = require('express');

const app = express();
const port = 3000;

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
