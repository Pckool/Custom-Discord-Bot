const express = require('express');
const _ = require('lodash');
const server = express();
const process = require('process');
const port = process.env.PORT?process.env.PORT:8887;
// fs
const fs = require('fs');
// discord
const discord = require('discord.js');
var client = new discord.Client();
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
	"R6" : "Shooters",
	"warframe" : "Looter Shooters",
	"anthem" : "Anthem",
	"youtube" : "YouTube Alerts",
	"twitch" : "Stream Alerts",
	"forhonor" : "RPGs",
	"apexlegends" : "Battle Royale"
}
var unauthed_users = {};

var msg_sevarity = {
	low : {
		color : "GREEN",
		here  : false,
		everyone : false 
			},
	med : {
		color : "ORANGE",
		here  : true,
		everyone : false
			},
	high: {
		color : "RED",
		here : false,
		everyone  : true
			},
	crit: {
		color : "PURPLE",
		here : false,
		everyone  : true
			}
}

var pollActive = false;

// Process Functions
process.on('exit', (code) => {
	console.log(`Exiting with code ${code}...`);
	
	client.destroy().then( () => {
		console.log('Discord client disconnected...');
		
		// delete app;
	})
	.catch( err => {
		// delete app;
	});
});

process.on('uncaughtException', (err) => {
	fs.writeSync(1, `Caught exception: ${err}\n`);
	console.log(`Caught exception: ${err}\n`);
});

// Main function (primes everything)
function main(){
	console.log('Booted successfully...');
	try{
		token = process.env.DISCORD_TOKEN?process.env.DISCORD_TOKEN:fs.readFileSync(`${__dirname}/token.dat`).toString().trim();
		discordLogin();
		
	}
	catch(e){
		console.error(e);
	}
	
	// console.log(token);
		
	
}

// Server functions


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
server.get('/users/unauthed', function(req, res){
	res.send(`${JSON.stringify(unauthed_users, undefined, 2)}`);
});

server.listen(port, () => { 
	console.log(`Express server listening on port ${port}...`);
	if(main != undefined){
		main();
	}
});


// Discord Functions
function discordLogin(callback){
	if(!token) return console.error('No login token was given');
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
client.on('guildMemberAdd', sendVerification);

function sendVerification(member){
	try{
		console.log('\n---------------------------------------------\n')
		// console.log(member);
		if (member.roles){
			// this means it is not a guild member message but a dm
			console.log(`User ${member.user.username} needs to be verified! Added them to the unauthed list.`);
			var val = Math.floor(1000 + Math.random() * 9000);

			unauthed_users[member.user.username] = { "capcha": val, "member_id": member.id };
			setToSaveFile("user_verification", unauthed_users);

			return member.send(`To prove your not a dastardly robot, please type this \`auth ${val}\``)
			.catch((err) => { return err });
		}
		else if (member.username){
			console.log(`User ${member.username} needs to be verified! Added them to the unauthed list.`);
			var val = Math.floor(1000 + Math.random() * 9000);

			unauthed_users[member.username] = { "capcha": val, "member_id": member.id };
			setToSaveFile("user_verification", unauthed_users);

			return member.send(`To prove your not a dastardly robot, please type this \`auth ${val}\``)
			.catch((err) => { return err });
		}
		else{

		}
		
	}
	catch(e){
		console.error(e);
		
	}
	
}

client.on('guildMemberRemove', removeVerification);

function removeVerification(member){
	console.log(`User ${member.user.username} is being removed from the unverified list.`);	
	unauthed_users[member.user.username] = undefined;
	setToSaveFile("user_verification", unauthed_users);
	
}

function clearUnauthList(){
	unauthed_users = {};
	setToSaveFile("user_verification", unauthed_users);
}

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

client.on('message', msg => {
	// console.log('A message was sent somewhere...');
	if(msg.guild)
		discordComm(msg);
	else
		discordDM(msg);	
		
});


function guildPrimer(){
	/*guild_client.on('message', msg => {
		if(msg.guild){
			if(msg.content.startsWith(dis_prefix)){
				discordComm(msg);
			}
		}
		else
			discordDM(msg);	
		
	});*/

}

function discordDM(msg){
	console.log(`DM[${msg.author.username}<${msg.author.id}>]: ${msg.content}\n`);
	if(msg.mentions.users.size > 0 ){
		let usr_mentions = msg.mentions.users;
		if(usr_mentions.has(client.user.id)){
			console.log('Found a mention of me...');
			if(msg.content.toLowerCase().includes(' hello') || msg.content.toLowerCase().includes(' hi')){
				msg.channel.send(`Hey there, ${msg.author}!`);
			}
			
		}	
			
	}
	
	if(msg.content.startsWith('auth')){
		
		let dataArr = msg.content.split(' ');
		if(unauthed_users[msg.author.username]){
			if(parseInt(dataArr[1]) === unauthed_users[msg.author.username].capcha){
				// authorized the user
				// find the member in the members list and add the role to them
				guild_members.find(member => member.id === unauthed_users[msg.author.username].member_id).addRole(guild_roles.find(role => role.name === "Verified"));
				msg.author.send(`**You have been __authorized!__**\n\nWelcome to the server, not a robot! Make sure you read the rules and info of the server! If you need a list of commands, just message me \`help\` or use the \`%help\` command in the discord. My prefix for commands is \`%\`. (I know it's weird, just deal with it.)`);
				unauthed_users[msg.author.username] = undefined;
				setToSaveFile("user_verification", unauthed_users);
				console.log(`User ${msg.author} authenticated successfully!`);
			}
			else{
				msg.author.send('That wasn\'t the right code.');
				console.warn(`User ${msg.author.username} failed to authenticate...`);
			}
		}
		else{
			msg.author.send('Something went wrong during verification. If you would like to retry, please type `verify`');
			console.warn(`I cant find the user ${msg.author.username} in the unauthed user list...\n`);
		}
	}
	else if(msg.content.startsWith('verify')){
		if(msg.member) sendVerification(msg.member);
		else{
			console.log(`I coulen't find the user ${msg.author} in the guild.`);
			sendVerification(msg.author);
		} 
	}
	
}

function discordComm(msg){
	let usr_mentions = undefined;
	if(msg.mentions.users.array().length > 0)
		usr_mentions = msg.mentions.users;

	// console.log('A message was sent in the guild...');
	if(msg.content.startsWith(dis_prefix)){
		
		// Everyone
				
		if(msg.content === `${dis_prefix}help`){
			msg.channel.send(`Sending you the list of basic commands, ${msg.author}...`);
			msg.author.send(`__**Commands List**__\n${fs.readFileSync(`${__dirname}/commandsList.md`)}`)
			.catch( (err) => {
				msg.channel.send('I can\'t send a message to you. Check your privacy settings?');
			});
		}
		else if(msg.content === `${dis_prefix}devo`){
			let devo = {};
			guild_members.forEach(person => {
				// console.log(person.user.username);
				if(person.user.username.includes('devo'))
					devo = person;
				else if(person.id === '367500108163579904')
					devo = person;
			});
			msg.channel.send(`${devo} looks like a thumb.\n`);
		}
		else if(msg.content.toLowerCase() === `${dis_prefix}verify`){
			msg.channel.send(`Restarting your Verification process now. Please check your DM's`);
			if(msg.member) sendVerification(msg.member);
			else sendVerification(msg.author);
		}
		else if(msg.content.toLowerCase() === `${dis_prefix}69`){
			msg.channel.send('BLICKY GOT THE STICKY UHH');
		}
		else if(msg.content.toLowerCase() === `${dis_prefix}poopityscoop`){
			msg.channel.send('__The Wise words of Kanye__\nPoopy-di scoop\nScoop-diddy-whoop\nWhoop-di-scoop-di-poop\nPoop-di-scoopty\nScoopty-whoop\nWhoopity-scoop, whoop-poop');
		}
		
		

		// Admins
		else if(msg.content.toLowerCase() === `${dis_prefix}resetmessage`){
			if(msg.guild && msg.member.hasPermission(discord.Permissions.FLAGS.ADMINISTRATOR)){
				msg.delete();
				discordPostRoleAss();
			}
			else{
				msg.channel.send(`Sorry, you don't have permission to use that command. :sad:`);
			}
		}
		else if(msg.content.toLowerCase() === `${dis_prefix}reload`){
			if(msg.guild && msg.member.hasPermission(discord.Permissions.FLAGS.ADMINISTRATOR))
				refreshServerData();
			else{
				msg.channel.send(`Sorry, you don't have permission to use that command. :sad:`);
			}
		}
		else if(msg.content.toLowerCase().startsWith(`${dis_prefix}post `) ){
			if(msg.guild && msg.member.hasPermission(discord.Permissions.FLAGS.ADMINISTRATOR)){
				if(msg.content.toLowerCase().substring(6).startsWith('update ')){
					postUpdate(msg.content.substring(13), msg);
				}
			}
			else{
				msg.channel.send(`Sorry, you don't have permission to use that command. :sad:`);
			}
		}
		else if(msg.content.toLowerCase().startsWith(`${dis_prefix}forceverify `)){
			if(msg.guild && msg.member.hasPermission(discord.Permissions.FLAGS.ADMINISTRATOR)){
				if(usr_mentions){
					let msg_to = [];
					usr_mentions.forEach((usr) => {
						if(usr.id != client.id){
							let mem = guild_members.find(el => el.user.username === usr.username);
							if(mem) sendVerification(mem);
							else
							msg.author.send('I couldn\'t find the user to force verify.');
						}
					});
					msg.author.send(`Users \`(${msg_to.join(', ')})\` were all sent a verification message.`);
					msg.delete();
					
				}
			}
			else{
				msg.channel.send(`Sorry, you don't have permission to use that command. :sad:`);
			}	
		}
		else if(msg.content.toLowerCase() ===`${dis_prefix}unauthedlist`){
			if(msg.guild && msg.member.hasPermission(discord.Permissions.FLAGS.ADMINISTRATOR)){
				
				/*setTimeout( () => {
					
				}, 60000);
				*/
				msg.author.send(`Please go to http://tdefton.systems:${port}/users/unauthed and make sure you jave a JSON parser extension.`);
				msg.delete();
			}
			else{
				msg.channel.send(`Sorry, you don't have permission to use that command. :sad:`);
			}
		}
		else if(msg.content.toLowerCase() === `${dis_prefix}clearunauthlist`){
			if(msg.guild && msg.member.hasPermission(discord.Permissions.FLAGS.ADMINISTRATOR)){
				msg.channel.send('**Are you sure** you want to clear the list of unauthed users? These users will have to manualy restart the verification process or rejoin the server to get verified.')
				.then(msgConfirm => {
					let filter = (reaction, user) => user.id === msg.author.id;
					let rf = msgConfirm.createReactionCollector(filter, {time: 30000})
					rf.on('collect', reaction => {
						msg.channel.send('Clearing the Unauthorized user list...');
						clearUnauthList();
					});
					rf.on('end', collected => {});
				});
			}
			else{
				msg.channel.send(`Sorry, you don't have permission to use that command. :sad:`);
			}
		}
			
		// Announcer || admin
		else if(msg.content.toLowerCase().startsWith(`${dis_prefix}announce `) ){
			if(msg.guild && (msg.member.hasPermission(discord.Permissions.FLAGS.ADMINISTRATOR) || msg.member.roles.find(role => role.name === "Announcer") )){
				let msg_arr = msg.content.split(" ");
				// index 0: start of command
				// index 1: sevarity
				// index 2+: Message
				
				// if the sevarity given is in the list of levels...
				if(msg_sevarity[msg_arr[1].toLowerCase()]){
					// post the announcement with the given sevarity
					postAnnouncement(msg.content.slice(msg.content.indexOf(msg_arr[1]) + msg_arr[1].length + 1), msg.author.username, msg_arr[1].toLowerCase());
					msg.delete();
				}
				else{
					cmdError()
					let embed_msg = new discord.RichEmbed();
						embed_msg.setTitle('Incorrect Syntax');
						embed_msg.setDescription('I expected some format and you did not follow it :(');
						embed_msg.setColor(0xFF0000);
						embed_msg.addField('Expected', '`%announce <low|med|high|crit> <message>`');
						embed_msg.addField('Given', `\`${msg_arr[0]} ${msg_arr[1]} <message>\``);	
	
					msg.channel.send(embed_msg);
				}
				
				
			}
			else{
				msg.channel.send(`Sorry, you don't have permission to use that command. :sad:`);
			}
		}
		else if(msg.content.toLowerCase().startsWith(`${dis_prefix}poll `)){
			if(msg.guild && (msg.member.hasPermission(discord.Permissions.FLAGS.ADMINISTRATOR) || msg.member.roles.find(role => role.name === "Announcer") )){
				let msg_arr = msg.content.split(" ");
				// index 0: command start
				// index 2: lol the message dummy
				makePoll(msg.content.slice(6), msg.author.username);
				msg.delete();
				
				
			}
			else{
				msg.channel.send(`Sorry, you don't have permission to use that command. :sad:`);
			}
		}
		else if(msg.content.startsWith(`${dis_prefix}`)){
			msg.channel.send(`${msg.author}, that command doesn't exist :sad:`);
			
		}
		
				
	}
	else if(usr_mentions && usr_mentions.find(el => {return el.id === client.user.id})){
		console.log('Someone mentioned me in the guild!');
		if(msg.content.toLowerCase().includes('sorry')){
			msg.channel.send(`It's okay ${msg.author}`);
		}
		
	}

}

/**
	* This function sends a message into the role assignment channel and adds reactions to it for people to also react to and recieve/remove a corresponding role
	*/
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
					msg.react(emoji_catalog.apexlegends.id);
				})
				.catch(err => {
					console.log("Something went wrong...\n" + err)
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
					msg.react(emoji_catalog.apexlegends.id);	
					currentPost = msg;
					// console.log(currentPost);
					saveData.saveMessage.id = msg.id;
					fs.writeFileSync(`${__dirname}/data.json`, JSON.stringify(saveData) );
				});
			}
			
			
			
			addReactionEvents();
		}
	});			
}

function insertEmojis(message){
	guild_emojis.forEach(el => {
		
		if(message.includes(`:${el.name}:`)){
			// console.log(el.name);
			let find = new RegExp(`:${el.name}:`, "g");
			message = message.replace( find, toEmoji(emoji_catalog[el.name]) );
			// console.log(`${message}\n`);
		} 
	});
	
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
				console.log('Unable to find corresponding role... Removing reaction...');			
				messageReaction.remove(usr);
			}

		}
		// If it turns out that it is the bot creating the post or the user is reacting to a different message.
		else{
			console.log(`${usr.username} reacted to a post...`)
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
		data = JSON.parse( fs.readFileSync(`${__dirname}/data.json`) );
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
	if(data.user_verification){
		unauthed_users = getFromSaveFile('user_verification');
		//console.log(JSON.stringify(unauthed_users, undefined, 2));
	}
	if(!unauthed_users){
		console.log(`There was a problem retrieving the unauthed users from the save file\nERROR: ${e}`);
	}
}

function setToSaveFile(name, dataToAppend){
	try{
		data = JSON.parse( fs.readFileSync(`${__dirname}/data.json`) );
		data[name] = dataToAppend;
		fs.writeFileSync(`${__dirname}/data.json`, JSON.stringify(data) );
		
	}
	catch(e){
		console.log(`There was a problem retrieving or saving the save file\n${e}`);
	}
}

function remFromSaveFile(name){
	try{
		data = JSON.parse( fs.readFileSync(`${__dirname}/data.json`) );
		data[name] = undefined;
		fs.writeFileSync(`${__dirname}/data.json`, JSON.stringify(data) );
		
	}
	catch(e){
		console.log(`There was a problem retrieving or saving the save file\n${e}`);
	}
}
function getFromSaveFile(name){
	try{
		data = JSON.parse( fs.readFileSync(`${__dirname}/data.json`) );
		return data[name];
		
	}
	catch(e){
		console.log(`There was a problem retrieving or saving the save file\n${e}`);
		return undefined;
	}
}


function refreshServerData(){
	checkSaveFile();
	getMembers();
	getMembers();
	getRoles();
}

function postUpdate(content, msg){
	guild_channels.forEach(el => {
		if((el.name === "bot-updates" || el.name === "comet-watch") && el.type === "text"){
			let message = insertEmojis(content);
			console.log(content);
			el.send(`**__Update__**\n${content}`)
			.then(newMessage => {
				msg.delete();
				msg.author.send(`**Bot Update** posted successfully!\n\n__Message__\n${content}`);
			});
		}
	});
}

function dynamicRoomCreation(){
	if(msg.sontent.startsWith(`${dis_prefix}newroom `)){
		
	}
	guild_channels.get();
}


function makeEmbed(title, message, color, field=[], footer=""){
	let embed_msg = new discord.RichEmbed();
		embed_msg.setTitle(title);
		embed_msg.setDescription(message);
		embed_msg.setColor(color);
		embed_msg.setFooter(footer);
	if(field !== [])	
		field.forEach( function(el) {
			embed_msg.addField(el);
		});
	return embed_msg;
}

function cmdError(title, message, color, field=[], footer=""){
	return makeEmbed(title, message, color, field, footer);
}


function makePoll(str, username){
	if(!pollActive){
		guild_channels.array().forEach( function(chnl){
			if(chnl.name === 'polls' && chnl.manageable && chnl.type === 'text'){
				let embed_msg = new discord.RichEmbed();
					embed_msg.setTitle('Poll');
					embed_msg.setDescription(str);
					embed_msg.setColor(0x1153FF);
					embed_msg.setFooter(`Poll posted by ${username}`);
				chnl.send(embed_msg)
				.then(function(msg) {
					msg.react('✅');
					msg.react('❎');
					guild_client.on('messageReactionAdd', function(reaction, user){
						if(reaction.message.id === msg.id){
							if( ! user.bot && reaction.emoji.name !== '✅' || reaction.emoji.name !== '❎'){
								reaction.remove();
							}
							else{
								console.log(`${reaction.author.username} reacted to a poll...`);
							}
						}
					
					});
				});
			}
		
		});	
	}
	
}


function postAnnouncement(str, username, sev){
	guild_channels.array().forEach( function(chnl){
		// console.log(chnl);
		if(chnl.name === 'announcements' && chnl.manageable && chnl.type === 'text'){
			// getting the text from a file and sending it to the server channel 'role assignment'
			let message = str;
				
			let embed_msg = new discord.RichEmbed();
				embed_msg.setTitle('Announcement');
				embed_msg.setDescription(message);
				embed_msg.setColor(msg_sevarity[sev].color);
				embed_msg.setFooter(`Announcement posted by ${username}`);
			chnl.send(embed_msg)
			.then((msg) => {
				if(msg_sevarity[sev].here === true)
					chnl.send("@here");
				if(msg_sevarity[sev].everyone === true)
					chnl.send("@everyone");
			});
			
		}
	});	
}

