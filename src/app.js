const path = require('path');

let argv = handleCommandLineArguments();

const env = require('./environment.js')
if (env.load()) { return; };
if (env.validate()) { return; };

const nunjucks = require('nunjucks');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const logger = setupLogger();
const db = setupDatabase();
const app = express();
const port = process.env.PORT;

const handlers = new (require('./handlers.js'))(db, logger, stripe);

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

app.listen(port, () => console.log(`Payment service listening on port ${port}!`));


function setupLogger() {
	const logDir = 'log';
  	const temp_path= path.resolve(__dirname,'../logdir') //Path to logDir where all logs will be saved

 	const dailyRotateFileTransport = new transports.DailyRotateFile({ //Makes a new log document every day
    		filename: temp_path+`/%DATE%-log.json`,
    		datePattern: 'YYYY-MM-DD'
  	});

	const logger = createLogger({
  		level: 'info',  //Level is set to info, can change levels if you want to use it to something different feks debug
  		format: format.combine(
      		format.colorize(),
      		format.timestamp({
          		format: 'DD-MM-YYYY HH:mm:ss' //Date and time
      		}),
      		format.json()),
  	transports: [ new transports.Console({
    		level: 'info',
    		format: format.combine(
      		format.colorize(),
      		format.printf(
        		info => `${info.timestamp} : ${info.message}`//How it should look in the log document
      		))
  		}),dailyRotateFileTransport] //Transport command to send it tot the chosen log fil
	});

	return logger;
}

function setupDatabase() {
	let db = new sqlite3.Database(path.resolve(__dirname, `../db/${process.env.DATABASE_NAME}`));

	db.run('CREATE TABLE IF NOT EXISTS Payment(OrderID INTEGER PRIMARY KEY, Sum REAL, Tips REAL, DeliveryPrice REAL, Paid INTEGER, PaidDate TEXT, Discount REAL)', function(err) {
		if (err) {
			console.log(err.message);
		}
	});

	return db;
}

function handleCommandLineArguments() {
	let argv = require('minimist')(process.argv.slice(2));


	if (argv['redirect_console_log']) {
		console.log = function(v) {
			return;
		}
	}
	

	return argv;
}
