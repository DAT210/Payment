# Payment Service
> Payment API

The Payment Service can be used to charge customers.
Supports Paypal, Stripe and cash.

## Installing / Getting started

You can run the Payment service with Docker or Node.

This service depends on API keys from Paypal and Stripe.
Before running you need have them in a environment file.
Copy and rename the /env/default.env fileand fill in your keys.
You .env file should be named prod.env if you're running with Docker.
The service determines which .env file to use based on your NODE_ENV environment variable.
It is currently not possible to run the service without a environment file.

Docker
```shell
# Navigate to project directory
cd project_directory
# Create .env file
cp ./env/default.env ./env/prod.env
# Insert your keys
# The PORT variable will be ignored when the service is ran with Docker
vi ./env/prod.env
# Create a Docker image called paymentservice
docker build -t paymentservice --build-arg port=<port> .
# Run the image in detached mode
docker run -p <running_port>:<port> -d paymentservice
```

Node
```shell
# Navigate to project directory
cd project_directory
# Install dependencies
npm install
# Create .env file
node tools/setup_env.js
# Set environment variable
	# Windows Powershell
    	$env:NODE_ENV = "<name>"
	# Windows CMD
	SET NODE_ENV=<name>
# Run the server
node src/app.js

# If you're using a linux terminal you run
# it when you set the environment variable
NODE_ENV=<name> node src/app.js
```

You can now connect to the service at localhost:port.

## Developing

### Built With
Javascript, NodeJS, ExpressJS and Nunjucks

### Prerequisites
You need [NodeJS](https://nodejs.org) to develop this service. Built with version 8.12.0.

### Setting up Dev

```shell
# Clone repository from github
git clone https://github.com/DAT210/Payment.git
# Navigate to it
cd Payment/
# Install dependencies
npm install
# Create dev environment file
	cp ./env/default.dev ./env/dev.env
	vi ./env/dev.env
# Or
	node tools/setup_env.js
```

### Deploying / Publishing
give instructions on how to build and release a new version
In case there's some step you have to take that publishes this project to a
server, this is the right time to state it.

```shell
packagemanager deploy your-project -s server.com -u username -p password
```

And again you'd need to tell what the previous code actually does.


## Configuration

### Environment file

You can configure which port the service runs on and which database you use in an environment file.This file is also used to store your API keys. It should be placed in the /env/ file, and the name needs to end in .env. [Example file](env/default.env). If you've installed node, you can also generate one using the ```node tools/setup_env.js``` command.

### Command line arguments

Arguments:
- ```--redirect_console_log``` , redirects output from all console.log() calls from stdout to nothing. 

## Tests

Before running any tests you need to set up a /env/test.env file with 
your api keys.

Linux users can run `npm test`

Windows users have to use PowerShell and run it using `$env:NODE_ENV = "test" ; npm run-script test-windows`

If you're using Git BASH the command is `export NODE_ENV="test" ; npm run-script test-windows`

If you're not using a linux terminal Windows PowerShell, you can still run the tests. You need to
- Set the environment variable NODE_ENV to "test".
- Start the server (`node src/app.js`)
- Start the tests (written using the [mocha](https://mochajs.org/) framework.

## Style guide
Explain your code style and show how to check it.

to test style run
	jshint <file to test> 
in command window

uses standard jshint style
## API Reference

The API doesn't require any authentication (yet).

### Endpoints:

GET /payment-pages/:orderId?page=["payment", "method", "cash", "confirmed"]

GET /payments/:orderId

POST /payments/

### Details:

#### GET /payment-pages/:orderId?page=["payment", "method", "cash", "confirmed"]
	Returns the html pages so users can pay for their order.
	?page=
		payment => The user can see their total price and add a tip.
		method => The user can select their payment method.
		cash => Page asking for confirmation of cash payment.
		confirmed => Page confirming that the order is payed for.

#### GET /payments/:orderId
	Returns information about a payment
	Status code 200 => Payment exists and information was returned.
	Status code 404 => Payment doesn't exist and no information was returned.
	Response format
		{
			"Order_ID":	int,
			"Sum":		real,
			"Tips":		real,
			"DeliveryPrice"	real,
			"Paid":		int,
			"Paid_Date":	string,
			"Discount":	real
		}

#### POST /payments/
	Used to signal that an order need a payment.
	Request body format:
		{
			"customer_ID":	int,
			"order_ID":	int,
			"delivery":
			{
				"price":	real,
				"method":	string,
				"est_time":	string,
				"address":	string
			},
			"ordered":
			[
				{ 
					"name":		string,
					"id":		int,
					"price":	real,
					"amount":	int
				}
			]
		}

## Database

This service is built with [SQLite](https://www.sqlite.org/), using the [sqlite3 package](https://www.npmjs.com/package/sqlite3). Database version is based on the version on your system. If you don't have SQLite on your system, version 3.15.0 will be used. You can download SQLite [here](https://www.sqlite.org/download.html).

The database only has one table: Payment, with columns:
- OrderID	INTEGER PRIMARY KEY
- Sum		REAL
- Tips		REAL
- DeliveryPrice	REAL
- Paid		INTEGER
- PaidDate	TEXT
- Discount	REAL

Sum, Tips, DeliveryPrice and Discount are used to calculate how much the customer should pay.

Paid is true (1) when the customer has paid, or false (0) when the customer still needs to pay.

PaidDate is the date when the customer paid (in string format), or NULL.

## Licensing

State what the license is and how to find the text version of the license.
