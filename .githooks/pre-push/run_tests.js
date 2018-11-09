#!/usr/bin/env node

var shell = require('shelljs');
var test = shell.exec('npm test');

if (test.code !== 0) {
	shell.echo('Error: Tests failed, push aborted');
	shell.exit(1);
}
