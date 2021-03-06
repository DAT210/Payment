const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const values = [
	{ 'prompt': 'environment name',	'value': 'dev',		'file': '' },
	{ 'prompt': 'port number',	'value': '37202',	'file': 'PORT' },
	{ 'prompt': 'database name',	'value': 'dev.db',	'file':	'DATABASE_NAME' },
	{ 'prompt': 'paypal sandbox',	'value': 'none',	'file': 'PAYPAL_SANDBOX_ID' },
	{ 'prompt': 'paypal production','value': 'none',	'file': 'PAYPAL_PRODUCTION_ID' },
	{ 'prompt': 'stripe publish',	'value': 'none',	'file': 'STRIPE_PUBLISH_KEY' },
	{ 'prompt': 'stripe secret',	'value': 'none',	'file': 'STRIPE_SECRET_KEY' },
	{ 'prompt': 'rewards service',	'value': 'none',	'file': 'REWARDS_SERVICE' },
	{ 'prompt': 'orders service',	'value': 'none',	'file': 'ORDERS_SERVICE' }
];

let q = 0;

rl.setPrompt(`Enter ${values[q].prompt}: (${values[q].value}) `);
rl.prompt();

rl.on('line', (line) => {
	if (line !== '') {
		values[q].value = line;
	}

	q++;
	if (q < values.length) {
		rl.setPrompt(`Enter ${values[q].prompt}: (${values[q].value}) `);
		rl.prompt();
	} else {
		rl.close();
	}
}).on('close', () => { 
	createEnvironmentFile();
});

function createEnvironmentFile() {
	let fileName = values[0].value + '.env';
	let filePath = path.resolve(__dirname, `../env/${fileName}`);
	
	let fileContent = '';
	for (let i = 0; i < values.length; i++) {
		if (values[i].file === '') { continue; }

		fileContent += `${values[i].file} = ${values[i].value} \n`;
	}

	fs.writeFile(filePath, fileContent, function(err) {
		if (err) { throw err; }
	});
}
