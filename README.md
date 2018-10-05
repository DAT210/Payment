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
vi ./env/prod.env
# Create a Docker image called PaymentService
docker build -t PaymentService .
# Run the image at <port> in detached mode
docker run -p <port>:3000 -d PaymentService
```

Node
```shell
# Navigate to project directory
cd project_directory
# Install dependencies
npm install
# Create .env file
cp ./env/default.env ./env/<name>.env
# Insert your keys
vi ./env/<name>.env
# Set environment variable
	# Windows Powershell
    	$env:NODE_ENV = $env:NODE_ENV + "<name>"
	# Windows CMD
	SET NODE_ENV=<name>
# Run the server
node src/app.js

# If you're using a linux terminal you run
# it when you set the environment variable
NODE_ENV=<name> node src/app.js
```

You can now connect to the service at localhost:3000 (or localhost:<port> if you're using Docker).

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

Here you should write what are all of the configurations a user can enter when
using the project.

## Tests

Describe and show how to run the tests with code examples.
Explain what these tests test and why.

```shell
Give an example
```

## Style guide

Explain your code style and show how to check it.

## Api Reference

If the api is external, link to api documentation. If not describe your api including authentication methods as well as explaining all the endpoints with their required parameters.


## Database

Explaining what database (and version) has been used. Provide download links.
Documents your database design and schemas, relations etc... 

## Licensing

State what the license is and how to find the text version of the license.
