const express = require('express');
const server = express();
const port = 8888;

// discord
const discord = require('discord.js');
var client;
var token = undefined;
var dis_resData = {};
var dis_prefix = '%';
var guild = undefined;
var guild_channels = undefined;
var guild_emojis = undefined;
var guild_members = undefined;
var guild_roles = undefined;
var guild_client = undefined;

var currentPost = undefined;

	// emojis
var emoji_catalog = {};
	// Roles
var role_catalog = {};
	// Members
var member_catalog = {};

var emojiToRole = {
	"news" : "News Alerts",
	"R6" : "Rainbow Six Siege",
	"warframe" : "Warframe",
	"anthem" : "Anthem",
	"youtube" : "YouTube Alerts",
	"twitch" : "Stream Alerts",
	"forhonor" : "For Honor"
}

// Vue.js
const vue = require('vue');

// bootstrap
//require('bootstrap');

// fs
const fs = require('fs');

// Main function (primes everything)
function main(){
	console.log('Booted successfully...');
	token = fs.readFileSync(`${__dirname}/token.dat`).toString().trim();
	console.log(token);
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

var saveData = {
	saveMessage : {
		id: ""
	}
}


server.get('/', function(req, res){
	res.send('hello world!');
});
server.post('/', function(req, res){
	res.send('this is a post request.')
});
server.get('/dis_bot', function(req, res) {
	res.send(req.query);
	dis_resData = res.query;
});
server.get('/dis_bot/guild', function(req, res){
	res.send(guild);
});
server.get('/dis_bot/guild/members', function(req, res) {
	let mems = {};
	guild_members.forEach((el, i) => {
		mems[i] = {
			username: el.username,
			id: el.id
		};
	});
	res.send(mems);
});
server.get('/dis_bot/guild/channels', function(req, res) {
	res.send(guild_channels.array());
});
server.get('/dis_bot/guild/emojis', function(req, res) {
	res.send(guild_emojis.array());
});
server.get('/dis_bot/guild/emoji_catalog', function(req, res) {
	res.send(emoji_catalog);
});

// Discord Functions
function discordLogin(callback){
	client.login(token)
	.then(() => {
		if(callback) 
			callback();
	})
	.catch( err => {
		if(callback)
			callback(err);
		else
			throw err;
	});

}

function discordPrimer(){
	
	client.on('ready', () => {
		console.log('Bot connected to Discord API...');
		guild = client.guilds.first();
		guild_members = client.guilds.first().members;
		guild_channels = client.guilds.first().channels;
		guild_roles = client.guilds.first().roles;
		guild_emojis = client.guilds.first().emojis;
		guild_client = client.guilds.first().client;
		
		checkSaveFile();
		
		
		guildPrimer();	// This function will set the rules for how to bot responds with different messages.
		getEmojis();	// This function gets the emoji's and puts them into a new object called emoji_catalog. It only takes the emoji's name's and id's.
		getRoles();		// This function gets the roles and puts them into a new object called roles_catalog. It only takes the role's names and id's.
		getMembers();	// This function gets the members and puts them into a new object called members_catalog. It only takes the member's usernames and id's.
	});
	
}

function guildPrimer(){
	guild_client.on('message', msg => {
		if(msg.guild){
			if(msg.content.startsWith(dis_prefix)){
				discordComm(msg);
			}
		}
		discordConv(msg);	
		
	});

}

function discordConv(msg){
	if(msg.mentions.users.size > 0 ){
		let usr_mentions = msg.mentions.users;
		if(usr_mentions.has(client.user.id)){
			console.log('Found a mention of me...');
			if(msg.content.toLowerCase().includes(' hello') || msg.content.toLowerCase().includes(' hi')){
				msg.channel.send(`Hey there, ${msg.author}!`);
			}
		}
	}
	
}

function discordComm(msg){
	if(msg.content.startsWith(dis_prefix)){
		// Everyone
		let usr_mentions = undefined;
		if(msg.mentions.users.array().length > 0)
			usr_mentions.toLowerCase() = msg.mentions.users;
		
		if(msg.content === `${dis_prefix}help`){
			msg.channel.send(`Lemme message you with some basic commands, ${msg.author}... One second!`);
			msg.author.send('SIKE! I HAVE NO COMMANDS BOI! YEET! :joy:');
		}

		// Admins
		if(msg.guild && msg.member.hasPermission(discord.Permissions.FLAGS.ADMINISTRATOR)){
			if(msg.content.toLowerCase() === `${dis_prefix}resetram`){
				msg.delete();
				discordPostRoleAss();
			}
			if(msg.content.toLowerCase() === `${dis_prefix}reload`){
			}
			if(msg.content.toLowerCase().startsWith(`${dis_prefix}post `) ){
				if(msg.content.toLowerCase().substring(6).startsWith('update ')){
					postUpdate(msg.content.substring(13), msg);
				}
			}
		}
		
				
	}

}

function discordPostRoleAss(){
	guild_channels.array().forEach( function(chnl){
		// console.log(chnl);
		if(chnl.name === 'role-assignment' && chnl.manageable && chnl.type === 'text'){
			// getting the text from a file and sending it to the server channel 'role assignment'
			let message = fs.readFileSync(`${__dirname}/role-assignment-message.md`);
			
			message = message.toString();
			message = insertEmojis(message);
			let message_split = message.split(';');
				
			let embed_msg = new discord.RichEmbed();
				embed_msg.setTitle('Welcome to TDefton\'s Server!');
				embed_msg.setDescription(message);
				embed_msg.setColor("RANDOM");
			if(currentPost && currentPost.editable){
				console.log("Post already available; modifying the previous post...");
				currentPost.edit(embed_msg)
				.then(msg => {
					msg.react(emoji_catalog.news.id);
					msg.react(emoji_catalog.R6.id);
					msg.react(emoji_catalog.warframe.id);
					msg.react(emoji_catalog.anthem.id);
					msg.react(emoji_catalog.youtube.id);
					msg.react(emoji_catalog.twitch.id);
					msg.react(emoji_catalog.forhonor.id);
				});
			
			}
			else{	
				chnl.send(embed_msg)
				.then((msg) => {
					msg.react(emoji_catalog.news.id);
					msg.react(emoji_catalog.R6.id);
					msg.react(emoji_catalog.warframe.id);
					msg.react(emoji_catalog.anthem.id);
					msg.react(emoji_catalog.youtube.id);
					msg.react(emoji_catalog.twitch.id);
					msg.react(emoji_catalog.forhonor.id);		
					currentPost = msg;
					// console.log(currentPost);
					saveData.saveMessage.id = msg.id;
					fs.writeFileSync(`${__dirname}/post-message.json`, JSON.stringify(saveData) );
				});
			}
			
			
			
			addReactionEvents();
		}
	});				
}

function insertEmojis(message){
	guild_emojis.forEach(el => {
		if(message.includes(`:${el.name}:`)){
			let find = new RegExp(`:${el.name}:`, "g");
			message = message.replace( find, toEmoji(emoji_catalog[el.name]) );
		} 
	});
	//message = message.replace(/:news:/g, toEmoji(emoji_catalog.news));
	//message = message.replace(/:anthem:/g, toEmoji(emoji_catalog.anthem));
	//message = message.replace(/:R6:/g, toEmoji(emoji_catalog.R6));
	//message = message.replace(/:warframe:/g, `<:${emoji_catalog.warframe.name}:${emoji_catalog.warframe.id}>`);
	//message = message.replace(/:youtube:/g, `<:${emoji_catalog.youtube.name}:${emoji_catalog.youtube.id}>`);
	//message = message.replace(/:twitch:/g, `<:${emoji_catalog.twitch.name}:${emoji_catalog.twitch.id}>`);
	//message = message.replace(/:forhonor:/g, `<:${emoji_catalog.forhonor.name}:${emoji_catalog.forhonor.id}>`);
	message = message.replace(/;/g, '\n');
	return message;
}

function getEmojis(){
	guild_emojis.array().forEach(el => {
		emoji_catalog[el.name] = el;
	});
	// console.log(emoji_catalog);
}

function getRoles(){
	guild_roles.array().forEach(el => {
		role_catalog[el.name] = el;
	});
	// console.log(role_catalog);
}

function getMembers(){
	guild_members.array().forEach(el => {
		member_catalog[el.id] = el;
	});
	// console.log(member_catalog);
}


function toEmoji(emojiData){
	let emoji = `<:${emojiData.name}:${emojiData.id}>`
	return emoji;
}

function addReactionEvents(){
	guild_client.on('messageReactionAdd', (messageReaction, usr) => {
		let mem = guild_members.get(usr.id);	
		if(currentPost.id === messageReaction.message.id && usr.username != client.user.username){
			
			let emojiName = messageReaction.emoji.name;
			if(role_catalog[ emojiToRole[emojiName] ]){
				mem.addRole(role_catalog[ emojiToRole[emojiName] ].id, `${usr.username} reacted with the corresponding emote.`)
				.then(function(){
					console.log(`Assigned user ${usr.username} the role of ${guild_roles.get(role_catalog[ emojiToRole[emojiName] ].id).name}.`);
				})
				.catch(console.log);
			}
			else{
				messageReaction.remove(usr);
				console.log('Unable to find corresponding role... Removing reaction...');			
			}

		}
		// If it turns out that it is the bot creating the post or the user is reacting to a different message.
		else{
			console.log(`Removing reaction from ${usr.username}...`)
		}
	});
			
	guild_client.on('messageReactionRemove', (messageReaction, usr) => {
		let mem = guild_members.get(usr.id);	
		if(currentPost.id === messageReaction.message.id && usr.username != client.user.username){
			
			let emojiName = messageReaction.emoji.name;
			if(role_catalog[ emojiToRole[emojiName] ]){
				mem.removeRole(role_catalog[ emojiToRole[emojiName] ].id, `${usr.username} reacted with the corresponding emote.`)
				.then(function(){
					console.log(`Removed the user ${usr.username} from the role of ${guild_roles.get(role_catalog[ emojiToRole[emojiName] ].id).name}.`);
				})
				.catch(console.log);
			
			}
			else{
				console.log('Unable to find corresponding role... Changing nothing...')
			
			}
		}
	});
}

function checkSaveFile(){
	try{
		data = JSON.parse( fs.readFileSync(`${__dirname}/post-message.json`) );
		if(data.saveMessage.id != ""){
			guild_channels.forEach((el) => {
				if(el.name === "role-assignment" && el.type === "text"){
					el.fetchMessage(data.saveMessage.id)
					.then(message => {
						currentPost = message;
						console.log('Found my old post...');
						addReactionEvents();
					})
					.catch(console.log);
				}
			});
			
		}
	}
	catch(e){
		console.log(`There was a problem retrieving the save file\n${e}`);
	}
}

function refreshServerData(){
	checkSaveFile();
	getMembers();
	getMembers();
	getRoles();
	discordPostRoleAss();
}

function postUpdate(content, msg){
	guild_channels.forEach(el => {
		if(el.name === "bot-updates" && el.type === "text"){
			let message = insertEmojis(content);
			el.send(content + '\n@here')
			.then(newMessage => {
				msg.delete();
			});
		}
	});
}
