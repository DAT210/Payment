const path = require('path');
const sqlite3 = require('sqlite3').verbose();

module.exports.getDB = function setupDatabase() {
	let db = new sqlite3.Database(path.resolve(__dirname, `../db/${process.env.DATABASE_NAME}`));

	db.run('CREATE TABLE IF NOT EXISTS Payment(OrderID INTEGER PRIMARY KEY, Sum REAL, Tips REAL, DeliveryPrice REAL, Paid INTEGER, PaidDate TEXT, Discount REAL)', function(err) {
		if (err) {
			console.log(err.message);
		}
	});

	return db;
}
