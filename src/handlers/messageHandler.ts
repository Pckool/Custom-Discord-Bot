import { Message } from 'discord.js';
import { client } from '../client'

const dmFns: Array<(message: Message) => unknown> = [];
const gmFns: Array<(message: Message) => unknown> = [];

client.on('message', msg => {
	if(msg.author.id === client.user.id) return;
	else{console.log( 'Got a message from', msg.author.username)}
	
	if(msg.guild){
		gmFns.forEach(fn => fn(msg))
	}
	else{
		dmFns.forEach(fn => fn(msg))
	}
})

export function pushDMFunction(fn: (msg: Message) => unknown){
	dmFns.push(fn)
}
export function pushGMFunction(fn: (msg: Message) => unknown){
	gmFns.push(fn)
}
export function pushMessageFunction(fn: (msg: Message) => unknown){
	pushGMFunction(fn)
	pushDMFunction(fn)
}
export function sendMessage(){

}

// function discordDM(msg){
// console.log(`DM[${msg.author.username}<${msg.author.id}>]: ${msg.content}\n`);
// if(msg.mentions.users.size > 0 ){
// 	let usr_mentions = msg.mentions.users;
// 		if(usr_mentions.has(client.user.id)){
// 			console.log('Found a mention of me...');
// 			if(msg.content.toLowerCase().includes(' hello') || msg.content.toLowerCase().includes(' hi')){
// 				msg.channel.send(`Hey there, ${msg.author}!`);
// 			}
			
// 		}	
			
// 	}
	
// 	if(msg.content.startsWith('auth')){
		
// 		let dataArr = msg.content.split(' ');
// 		if(unauthed_users[msg.author.username]){
// 			if(parseInt(dataArr[1]) === unauthed_users[msg.author.username].capcha){
// 				// authorized the user
// 				// find the member in the members list and add the role to them
// 				guild_members.find(member => member.id === unauthed_users[msg.author.username].member_id).addRole(guild_roles.find(role => role.name === "Verified"));
// 				msg.author.send(`**You have been __authorized!__**\n\nWelcome to the server, not a robot! Make sure you read the rules and info of the server! If you need a list of commands, just message me \`help\` or use the \`%help\` command in the discord. My prefix for commands is \`%\`. (I know it's weird, just deal with it.)`);
// 				unauthed_users[msg.author.username] = undefined;
// 				setToSaveFile("user_verification", unauthed_users);
// 				console.log(`User ${msg.author} authenticated successfully!`);
// 			}
// 			else{
// 				msg.author.send('That wasn\'t the right code.');
// 				console.warn(`User ${msg.author.username} failed to authenticate...`);
// 			}
// 		}
// 		else{
// 			msg.author.send('Something went wrong during verification. If you would like to retry, please type `verify`');
// 			console.warn(`I cant find the user ${msg.author.username} in the unauthed user list...\n`);
// 		}
// 	}
// 	else if(msg.content.startsWith('verify')){
// 		if(msg.member) sendVerification(msg.member);
// 		else{
// 			console.log(`I coulen't find the user ${msg.author} in the guild.`);
// 			sendVerification(msg.author);
// 		} 
// 	}
	
// }