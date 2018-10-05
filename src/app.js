const path = require('path');

let envfile = process.env.NODE_ENV
if (envfile === undefined) {
	console.log('You need to set the NODE_ENV variable to run this program.');
	console.log('Rename the /env/default.env file to match your NODE_ENV variable, and fill in missing api keys');
	return;
}

require('dotenv').config({
	path: path.resolve(__dirname, `../env/${envfile}.env`)
});

const nunjucks = require('nunjucks');
const express = require('express');

const sqlite3 = require('sqlite3').verbose()

let db = new sqlite3.Database(path.resolve(__dirname, `../db/${process.env.DATABASE_NAME}`));

db.run('CREATE TABLE IF NOT EXISTS Payment(Order_ID INTEGER PRIMARY KEY, Sum INTEGER, Paid INTEGER, Paid_Date TEXT, Discount INTEGER)', function(err) {
	if (err) {
		console.log(err.message);
	}
});

const port = process.env.PORT
const app = express();

// Configures express to use nunjucks as template engine
nunjucks.configure(__dirname, {
	autoescape: true,
	express: app
});

app.use(express.static(__dirname, + '/static'));

// Example route
app.get('/', function (req, res) {

	res.render('payment.html');

});


/*
	Create db entry for orderid.
*/
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
			resp.message = "Could not create the payment"
			resp.description = err.message
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
*/
app.get('/payments/:orderId', function(req, res) {
	// Check orderid in db
	let orderid = parseInt(req.params.orderId, 10);

	db.get(`SELECT * FROM Payment WHERE Order_ID = ${orderid}`, (err, row) => {
		res.status(200).json(row);
		return;
	});

	res.status(404).end();
});



/*
	Called when user finishes payment on stripe or paypal (and cash?)
*/
app.put('/payments/:orderId', function(req, res) {
	let orderid = parseInt(req.params.orderId, 10);
	
	db.run(`ÙPDATE Payment SET Paid = 1, Paid_Date = DATETIME('now') WHERE Order_ID = ${orderid}`, (err) => {
		console.log(err.message);
		res.send(err.message);
		return;
	});

	res.send("Payment complete");
});

app.listen(port, () => console.log(`Payment service listening on port ${port}!`));
