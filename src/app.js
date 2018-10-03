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


// Example route
app.get('/', function (req, res) {

	res.render('payment.html');

});


/*
	Create db entry for orderid.
*/
app.post('/payment/:orderid', function(req, res) {
	// Retrieve order information from Orders service
	let orderid = req.params.orderid;
	console.log("Inserting new order " + orderid);	
	// Calculate price
	let sum = 0;
	
	db.run(`INSERT INTO Payment(Order_ID, Sum, Paid, Paid_Date, Discount) VALUES (${orderid}, ${sum}, 0, "0", 0)`, function(err) {
		if (err) {
			console.log(err.message);
			res.send(err.message);
		} else {
			res.send("OK");
		}
	});
});


/*
	Display payment page to user
*/
app.get('/payment/:orderid', function(req, res) {
	// Check orderid in db
	let orderid = parseInt(req.params.orderid, 10);

	// Check if user owns order

	db.get(`SELECT * FROM Payment WHERE Order_ID = ${orderid}`, (err, row) => {
		res.send(row);
		return;
	});

	// Render page
	res.send("empty page");
});


/*
	Check if a payment is complete
*/
app.get('/payment/:orderid/status', function(req, res) {
	// Check orderid in db
	let orderid = parseInt(req.params.orderid, 10);

	db.get(`SELECT * FROM Payment WHERE Order_ID = ${orderid}`, (err, row) => {
		res.send(row.Paid);
		return;
	});

	// Render page
	res.send("no data");
});



/*
	Called when user finishes payment on stripe or paypal (and cash?)
*/
app.post('/update_payment/:orderid/complete/', function(req, res) {
	let orderid = parseInt(req.params.orderid);
	db.run(`ÙPDATE Payment SET Paid = 1, Paid_Date = DATETIME('now') WHERE Order_ID = ${orderid}`, (err) => {
		console.log(err.message);
		res.send(err.message);
		return;
	});

	res.send("Payment complete");
});

















app.listen(port, () => console.log(`Payment service listening on port ${port}!`));
