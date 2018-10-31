module.exports = class Handlers {
	constructor(db, logger, stripe) {
		this.db = db;
		this.logger = logger;
		this.stripe = stripe;
	}


	getOrderPreview(orderid) {

		// Get order information from Orders group

		//To-Do: REMOVE ME!
		return [
			{
				"item": "Biff 200gr medium",
				"ammount": 1,
				"price": 249,
				"discount": {
					"type": "percent",
					"value": 10
				}
			},
			{
				"item": "Pasta",
				"ammount": 2,
				"price": 149,
				"discount": {
					"type": "cash",
					"value": 50
				}
			},
			{
				"item": "Pizza",
				"ammount": 1,
				"price": 349
			},
			{
				"item": "Påmmfritt",
				"ammount": 1,
				"price": 49}
		];

		return '';
	}

	getTotalPrice(orderid) {
		let db = this.db;
		return new Promise(function(resolve, reject) {
			let sql = `SELECT * FROM Payment WHERE OrderID=${orderid}`;
			db.get(sql, (err, row) => {
				if (err || row == undefined) {
					console.log(err);
					console.log(row);
					resolve(0);
				}

				resolve(row.PriceToPay);
			});
		});
	}

	payment_pages_handler(req, res) {
		let page = req.query.page;

		if (!['payment', 'method', 'cash', 'confirmed'].includes(page)) {
			console.log('not a valid page');
			res.status(404).end();
			return;
		}

		let orderid = parseInt(req.params.orderId, 10);
		this.db.get(`SELECT * FROM Payment WHERE OrderID = ${orderid}`, (err, row) => {
			if (err || row == undefined) {
				res.status(404).end();
				if (err) { console.log(err); }
				return;
			}

			if (page === 'payment') {
				let json = Object.assign({}, {coupons: [{id: 10, type: 0, value: 10}]}, {OrderID: orderid, OrderPreview: this.getOrderPreview(orderid)}, row);
				res.status(200).render('payment.html', json);
			} else if (page === 'method') {
				let json = Object.assign({}, {stripe_publish_key: process.env.STRIPE_PUBLISH_KEY}, row);
				res.status(200).render('choosepay.html', json);
			} else if (page === 'cash') {
				res.render('cashpay.html');
			} else if (page === 'confirmed') {
				res.status(500).send('Not implemented yet');
			} else {
				res.status(500).send('Not implemented yet');
			}
		});
	}

	post_payment_handler(req, res) {
		let orderid = parseInt(req.params.orderId, 10);
		console.log("Inserting new order " + orderid);

		let sum = 0;
		for(var i = 0; i < req.body.ordered.length; i++){
			sum += req.body.ordered[i].price;
		}

		let deliveryprice = 0;
		if(req.body.delivery != undefined){
			deliveryprice = req.body.delivery.price;
		}

		this.db.run(`INSERT INTO Payment(OrderID, CustomerID, PriceToPay, Sum, DeliveryPrice, Paid, PaidDate, Discount) VALUES (${orderid}, ${req.body.customer_ID}, ${sum + deliveryprice}, ${sum},${deliveryprice}, 0, "0", 0)`, function(err) {
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
	}

	patch_payment_handler(req, res) {
		let orderid = parseInt(req.params.orderId, 10);
		let col_val = '';
		
		if (req.body.tips !== undefined && req.body.tips < 0) {
			req.body.tips = 0;
		}

		Object.keys(req.body).forEach(function(key) {
			col_val += key + ' = ' + req.body[key] + ', ';
		});
		// Remove trailing ", "
		col_val = col_val.slice(0, -2);

		this.db.run(`UPDATE Payment SET ${col_val} WHERE OrderID = ${orderid}`);
		res.status(200).end();
	}


	payment_status_handler(req, res) {
		let orderid = parseInt(req.params.orderId, 10);

		this.db.get(`SELECT * FROM Payment WHERE OrderID = ${orderid}`, (err, row) => {
			if (row == undefined) {
				res.status(404).end();
			} else {
				res.status(200).json(row);
			}
		});
	}


	paypal_payment_handler(req, res) {
		let orderid = parseInt(req.params.orderId, 10);

		this.db.run(`UPDATE Payment SET Paid = 1, Paid_Date = DATETIME('now') WHERE OrderID = ${orderid}`, (err) => {
			if (err) {
				console.log(err.message);
			}

			this.logger.info(orderid + ' paypal ');
		});
	}

 	async stripe_payment_handler(req, res) {
		let orderid = parseInt(req.params.orderId, 10);

		let valid = false;
		await this.getTotalPrice(orderid).then(function(v) {
			valid = (v == req.body.pricePaid);
		});	
		
		if (!valid) {
			res.json({ paymentComplete: false });
			return;
		} else {
			let charge_token = req.body.id;
			let charge = this.stripe.charges.create({
				amount: req.body.pricePaid * 100,
				currency: 'nok',
				description: 'example charge',
				source: charge_token
			});
	
			charge.then(data => {
				let resp = JSON.parse('{}');
				resp.paymentComplete = data.paid;
				if (data.paid) {
					this.db.run(`UPDATE Payment SET Paid = 1, PaidDate = DATETIME('now') WHERE OrderID = ${orderid}`, (err) => {
						if (err) {
							console.log(err.message);
						}
					});
					this.logger.info(orderid + ' stripe ');
				}
	
				res.json(resp);
			}).catch(function (err) {
				console.log(err);
			});
		}
	}
};
