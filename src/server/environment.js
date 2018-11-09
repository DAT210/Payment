const path = require('path')

module.exports.load = function loadEnvironmentVariables() {
	let envfile = process.env.NODE_ENV;

	if (envfile === undefined) {
		console.log('You need to set the NODE_ENV variable to run this program.');
		console.log('Rename the /env/default.env file to match your NODE_ENV variable, and fill in missing api keys');
		return true;
	}

	require('dotenv').config({
		path: path.resolve(__dirname, `../../env/${envfile}.env`)
	});

	return false;
}

module.exports.validate = function validateEnvironmentVariables() {
	let requiredEnv = [
	  'PORT', 'DATABASE_NAME',
 	 'PAYPAL_SANBOX_ID', 'PAYPAL_PRODUCTION_ID',
 	 'STRIPE_PUBLISH_KEY', 'STRIPE_SECRET_KEY'
	];

	// Tests all requiredEnv vars if they are empty and if they are longer than 0 length
	let unsetEnv = requiredEnv.filter((env) => !(process.env[env] !== ""));
	if (unsetEnv.length > 0) {
  		console.log("Required ENV variables are not set: [" + unsetEnv.join(', ') + "]");
  		return true;
	}

	let db_name = process.env.DATABASE_NAME;
	if(!db_name.endsWith(".db")){
		console.log("Please enter a database name in the .env file. (needs to end in .db)");
		return true;
	}

	let port = parseInt(process.env.PORT, 10);
	if (port <= 0 || port > 65336) {
		console.log(`Not a valid port number. ${port} should be between 1 and 65336`);
		return true;
	}

	return false;
}
