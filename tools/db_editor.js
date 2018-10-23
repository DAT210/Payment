/*

	Usage:
		node db_editor.js <command>
			command,
				should be one of the defined commands (exit, help, insert, update, delete, list)
				can be empty if the --interactive flag is used.
	Flags:
		--interactive
			run the program in interactive mode
			you'll be able to enter several commands in the same session
	Examples:
		NODE_ENV node tools/db_editor.js list where Paid=0 --interactive
		NODE_ENV node tools/db_editor.js --interactive
		NODE_ENV node tools/db_editor.js list
		NODE_ENV node tools/db_editor.js help --interactive

*/



const path = require('path');
const sqlite3 = require('sqlite3').verbose();

if (loadEnvironmentVariables()) { return; }

let db_name = process.env.DATABASE_NAME;
if (db_name === undefined || db_name === '') { return; }
let db = new sqlite3.Database(path.resolve(__dirname, `../db/${process.env.DATABASE_NAME}`));

let argv = require('minimist')(process.argv.slice(2));

if (argv['_'].length > 0) { 
	parseCommand(argv['_']);
}

if (argv['interactive']) {
	const readline = require('readline');
	const reader = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: '> '});
	
	console.log('Interactive mode:');
	
	reader.prompt();
	reader.on('line', (line) => {	
		if (line === 'exit') { 
			reader.close();
		} else {
			parseCommand(line.split(' '));
			reader.prompt();
		}
	});
}

function parseCommand(command) {
	if 	(command[0] === 'list')   { listCommand(command);   }
	else if (command[0] === 'insert') { insertCommand(command); }
	else if (command[0] === 'delete') { deleteCommand(command); }
	else if (command[0] === 'update') { updateCommand(command); }
	else if (command[0] === 'help')   { helpCommand(command);   }
}

function helpCommand(command) {
	console.log('Commands: exit, list, insert, delete, update, help');
	if (command.length == 2) {
		if (command[1] === 'list') { console.log('list'); console.log('list where condition'); }
		else if (command[1] === 'insert') { console.log('insert column1=value1 column2=value2 ...'); }
		else if (command[1] === 'delete') { console.log('delete where condition'); }
		else if (command[1] === 'update') { console.log('update where condition values col1=val1,col2=val2...'); }
	}
}

function updateCommand(command) {
	let condition = command[2];
	let new_values = command[4];
	let sql = `UPDATE Payment SET ${new_values} WHERE ${condition}`;
	db.run(sql, (err) => { if (err) { console.log(err); } });
}

function deleteCommand(command) {
	let sql = `DELETE FROM Payment WHERE ${command[2]}`;
	db.run(sql, (err) => { if (err) { console.log(err); } });
}

function insertCommand(command) {
	let keys = [];
	let values = [];
	for (let i = 1; i < command.length; i++) {
		kv = command[i].split('=');
		keys.push(kv[0]);
		values.push(kv[1]);
	}
		
	let sql = `INSERT INTO Payment(${keys.join(', ')}) VALUES (${values.join(', ')})`;
	db.run(sql, (err) => { if (err) { console.log(err); } });
}

function listCommand(command) {
	let sql = 'SELECT * FROM Payment';
	if (command[1] == 'where') {
		sql += ` WHERE ${command[2]}`;
	}
	
	db.all(sql, (err, rows) => {
		for (let i = 0; i < rows.length; i++) { console.log(rows[i]); }
	});
}


function loadEnvironmentVariables() {
	let envfile = process.env.NODE_ENV;

	if (envfile === undefined) {
		console.log('NODE_ENV undefined');
		return true;
	}

	require('dotenv').config({
		path: path.resolve(__dirname, `../env/${envfile}.env`)
	});

	return false;
}
