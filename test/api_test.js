const assert = require('assert');
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

const superagent = require('superagent');
const sqlite3 = require('sqlite3').verbose()

let db = new sqlite3.Database(path.resolve(__dirname, `../db/${process.env.DATABASE_NAME}`));

async function cleandb() {
	await new Promise(function(resolve, reject) { db.run(`DELETE FROM Payment`, (err) => resolve()); });
	await new Promise(function(resolve, reject) { db.run(`VACUUM`, (err) => resolve()); });
}
cleandb();


let data = [
	{OrderID: 58, Sum: 150, DeliveryPrice: 0, Tips: 0, Paid: 1, PaidDate: '2018-05-19', Discount: 50 },
	{OrderID: 100, Sum: 750, DeliveryPrice: 200, Tips: 150, Paid: 0, PaidDate: '0', Discount: 50 },
	{OrderID: 104, Sum: 1750, DeliveryPrice: 100, Tips: 250, Paid: 1, PaidDate: '0', Discount: 150 }
];
for (let i = 0; i < data.length; i++) {
	let payment = data[i];
	db.run(`INSERT INTO Payment(OrderID, Sum, DeliveryPrice, Tips, Paid, PaidDate, Discount) VALUES (${payment.OrderID}, ${payment.Sum}, ${payment.DeliveryPrice}, ${payment.Tips}, ${payment.Paid}, "${payment.PaidDate}", ${payment.Discount})`);
}

describe('API', function() {
	describe('post(\'/payments/:orderId\')', function() {
		
		it('Should be inserted', function(done) {
			let url = `localhost:${process.env.PORT}/payments/10`;
			superagent
			.post(url)
			.set('accept', 'json')
			.send({ customer_ID: 1, order_ID: 1, ordered: [ { name: 'Cola', id: 9, price: 49.99, amount: 1 } ]})
			.end((err, res) => {
				if (err) { done(err); return; }
				if (res.status != 201) { done(res.description); return; }
				done();
			});
		});
		
		it('Should not be inserted', function(done) {
			let url = `localhost:${process.env.PORT}/payments/10`;
			superagent
			.post(url)
			.set('accept', 'json')
			.send({ customer_ID: 1, order_ID: 1, ordered: [ { name: 'Cola', id: 9, price: 49.99, amount: 1 } ]})
			.end((err, res) => {
				if (err) { done(); return; }
				if (res.status != 201) { done(); return; }
				done(false);
			});
		});

	});

	describe('get(\'/payments/:orderId\')', function() {
		
		for (let i = 0; i < data.length; i++) {
			it('Data with index ' + i, function(done) {
				superagent
				.get(`localhost:${process.env.PORT}/payments/${data[i].OrderID}`)
				.then(res => {
					let json = JSON.parse(res.text);					
					assert.deepEqual(data[i], json);
					done();
				})
				.catch(err => {
					done(err);
				});
			});
		}
		
	});	
});

db.close();
