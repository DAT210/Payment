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

db.run(`DELETE FROM Payment`);
db.run(`VACUUM`);
let data = [{Order_ID: 100, Sum: 75000, Paid: 0, Paid_Date: '0', Discount: 50000 }]
for (let i = 0; i < data.length; i++) {
	let payment = data[i];
	db.run(`INSERT INTO Payment(Order_ID, Sum, Paid, Paid_Date, Discount) VALUES (${payment.Order_ID}, ${payment.Sum}, ${payment.Paid}, ${payment.Paid_Date}, ${payment.Discount})`);
}

describe('API', function() {
	describe('get(\'/payments/:orderId\')', function() {
		
		it('json test', function(done) {
			superagent
				.get(`localhost:${process.env.PORT}/payments/100`)
				.then(res => {
					let json = JSON.parse(res.text);					
					assert.deepEqual(data[0], json);
					done();
				})
				.catch(err => {
					console.log(err.message);
					done(err);
				});


		});			
		
	});
	
	
});

db.close();
