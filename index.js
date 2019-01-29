const express = require('express');
const server = express();
const port = 8888;

// discord
const discord = require('discord.js');
const client;
var token = 'NTA5NzcwNzU1NzMxNDg4NzY4.DzEuSw.Moy3ZagdnfGPqcD1V_gOkuwm9nw';

// Vue.js
const vue = require('vue');

// bootstrap
require('bootstrap');



// Main function (primes everything)
function main(){
	console.log('Booted successfully...');
	client = new discord.Client();
	discordPrimer();
		
	discordLogin();
}

// Server functions
server.listen(port, () => { 
	console.log(`Express server listening on port ${port}...`);
	if(main != undefined){
		main();
	}
});


server.get('/', function(req, res){
	res.send('hello world!');
});
server.post('/', function(req, res){
	res.send('this is a post request.')
});
server.post('/dis_bot', (req, res) => {
	res.send(req.query);
});

// Discord Functions
function discordLogin(callback){
	client.login(token)
	.then(if(callback) callback())
	.catch(if(callback){
		callback(new Error(''))
		});
}

function discordPrimer(){
	
	client.on('ready', () => {
		console.log('Bot connected to Discord API...');
	});
	
	client.on('message', msg => {
		if(msg.content === 'ping'){
			msg.reply('pong!');
		}
	});
}

