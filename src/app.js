const path = require('path');

let argv = handleCommandLineArguments();

if (argv['env-file'] === undefined) {
	const env = require('./server/environment.js')
	if (env.load()) { return; };
	if (env.validate()) { return; };
}

const nunjucks = require('nunjucks');
const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const logger = require('./server/logger.js').getLogger();
const db = require('./server/database.js').getDB();
const app = express();
const port = process.env.PORT;

const handlers = new (require('./server/handlers.js'))(db, logger, stripe);

// Configures express to use nunjucks as template engine
nunjucks.configure(__dirname, { autoescape: true, express: app });

app.use(express.static(__dirname, + '/static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* External paths, can be called by other services. */
app.post('/payments/:orderId', (req, res) => handlers.post_payment_handler(req, res));
app.patch('/payments/:orderId', (req, res) => handlers.patch_payment_handler(req, res));
app.get('/payment-pages/:orderId', (req, res) => handlers.payment_pages_handler(req, res));
app.get('/payments/:orderId', (req, res) => handlers.payment_status_handler(req, res));

/* Internal paths, should only be used by this service. */
app.put('/paypal-payment/:orderId', (req, res) => handlers.paypal_payment_handler(req, res));
app.put('/stripe-payment/:orderId', (req, res) => handlers.stripe_payment_handler(req, res));
app.get('/cash-payment/:orderId', (req, res) => handlers.cash_payment_handler(req, res));
app.listen(port, () => console.log(`Payment service listening on port ${port}!`));

function handleCommandLineArguments() {
	let argv = require('minimist')(process.argv.slice(2));


	if (argv['redirect_console_log']) {
		console.log = function(v) {
			return;
		}
	}
	

	return argv;
}
