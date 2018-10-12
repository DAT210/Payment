const path = require('path');
const nunjucks = require('nunjucks');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

if (loadEnvironmentVariables()) { return; };
if (validateEnvironmentVariables()) { return; };

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

let db = new sqlite3.Database(path.resolve(__dirname, `../db/${process.env.DATABASE_NAME}`));

db.run('CREATE TABLE IF NOT EXISTS Payment(Order_ID INTEGER PRIMARY KEY, Sum INTEGER, Paid INTEGER, Paid_Date TEXT, Discount INTEGER)', function(err) {
	if (err) {
		console.log(err.message);
	}
});

const app = express();
const port = process.env.PORT;

// Configures express to use nunjucks as template engine
nunjucks.configure(__dirname, {
	autoescape: true,
	express: app
});

app.use(express.static(__dirname, + '/static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Example route
app.get('/', function (req, res) {

	res.render('payment.html');

});

app.get('/choosepay', function (req, res) {

	res.render('choosepay.html', {stripe_publish_key: process.env.STRIPE_PUBLISH_KEY, Order_ID: 310, price: 2500});

});

app.get('/cashpay', function (req, res) {

	res.render('cashpay.html');

});


app.post('/payments/:orderId', function(req, res) {

	// Retrieve order information from Orders service,
	// or get in from the request.
	let orderid = parseInt(req.params.orderId, 10);
	console.log("Inserting new order " + orderid);	

	// Calculate price
	let sum = 0;

	db.run(`INSERT INTO Payment(Order_ID, Sum, Paid, Paid_Date, Discount) VALUES (${orderid}, ${sum}, 0, "0", 0)`, function(err) {
		if (err) {
			console.log(err.message);
			
			let resp = JSON.parse('{}');
			resp.message = "Could not create the payment";
			resp.description = err.message;
			res.status(400).json(resp);
			
		} else {
			res.status(201).end();
		}
	});
});


/*
	Display payment page to user
*/
app.get('/payment-pages/:orderId', function(req, res) {
	// Check orderid in db
	let orderid = parseInt(req.params.orderId, 10);

	// Check if user owns order

	db.get(`SELECT * FROM Payment WHERE Order_ID = ${orderid}`, (err, row) => {
	});

	// Render page

	res.status(500).send('Not implemented yet');	
});


/*
	Get status about a payment

	Response format, JSON
	Valid response with data has status code 200.
	Code 404 means the payment doesn't exist
	{
		"Order_ID":	int,
		"Sum":		int,
		"Paid":		int,
		"Paid_Date":	string,
		"Discount":	int
	}
*/
app.get('/payments/:orderId', function(req, res) {
	// Check orderid in db
	let orderid = parseInt(req.params.orderId, 10);

	db.get(`SELECT * FROM Payment WHERE Order_ID = ${orderid}`, (err, row) => {
		if (row == undefined) {
			res.status(404).end();
		} else {
			res.status(200).json(row);
		}
	});
});



/*
	Internal path, should only be used by this service
	Called when user finishes payment on stripe
*/
app.put('/stripe-payment/:orderId', function(req, res) {
	let orderid = parseInt(req.params.orderId, 10);
		
	let charge_token = req.body.id;
	let charge = stripe.charges.create({
		amount: req.body.pricePaid,
		currency: 'usd',
		description: 'example charge',
		source: charge_token
	});
		
	charge.then(data => {	
		let resp = JSON.parse('{}');
		resp.paymentComplete = data.paid;
		if (data.paid) {
			db.run(`UPDATE Payment SET Paid = 1, Paid_Date = DATETIME('now') WHERE Order_ID = ${orderid}`, (err) => {
				if (err) {
					console.log(err.message);
				}
			});
		}

		res.json(resp);
	});
});



app.listen(port, () => console.log(`Payment service listening on port ${port}!`));



function loadEnvironmentVariables() {
	let envfile = process.env.NODE_ENV;

	if (envfile === undefined) {
		console.log('You need to set the NODE_ENV variable to run this program.');
		console.log('Rename the /env/default.env file to match your NODE_ENV variable, and fill in missing api keys');
		return true;
	}

	require('dotenv').config({ 
		path: path.resolve(__dirname, `../env/${envfile}.env`)
	});

	return false;
}

function validateEnvironmentVariables() {
	let requiredEnv = [
	  'PORT', 'DATABASE_NAME',
 	 'PAYPAL_SANBOX_ID', 'PAYPAL_PRODUCTION_ID',
 	 'STRIPE_PUBLISH_KEY', 'STRIPE_SECRET_KEY'
	];

	// Tests all requiredEnv vars if they are empty and if they are longer than 0 length
	let unsetEnv = requiredEnv.filter((env) => !(process.env[env] !== ""));
	if (unsetEnv.length > 0) {
  		console.log("Required ENV variables are not set: [" + unsetEnv.join(', ') + "]");
  		return true;
	}

	let db_name = process.env.DATABASE_NAME;
	if(!db_name.endsWith(".db")){
		console.log("Please enter a database name in the .env file. (needs to end in .db)");
		return true;
	}

	let port = parseInt(process.env.PORT, 10);
	if (port <= 0 || port > 65336) {
		console.log(`Not a valid port number. ${port} should be between 1 and 65336`);
		return true;
	}
	
	return false;
}	
