import { GuildMember, Message, User } from 'discord.js';
import redis from 'redis'
import { promisify } from 'util';
import { client } from '../client';
import { addRoleToUser, findRoleByName } from '../handlers/roleHandler';
const redisClient = redis.createClient({
	host: 'redis',
})
redisClient.on('error', (err) => {
	console.error(err);
})

import emoji from 'node-emoji'
import { pushDMFunction, pushMessageFunction } from '../handlers/messageHandler';

function setAuthKey(key: string, value: string | number){
	redisClient.set(key, String(value), redis.print)
}
async function getAuthKey(key: string){
	return await promisify(redisClient.get).bind(redisClient, key)()
}
async function delAuthKey(key: string){
	return await promisify(redisClient.del).bind(redisClient, key)()
}
const isGuildMemeber = (inp: GuildMember | User): inp is GuildMember => {
	return (inp as GuildMember).user !== undefined 
}
export function sendVerification(member: GuildMember | User){
	try{
		const val = Math.floor(Math.random() * Math.pow(10, 6));

		if (isGuildMemeber(member)){
			console.log(member.user.id)
			console.log(`User ${member.user.username} needs to be verified! Added them to the unauthed list.`);
			setAuthKey(member.user.id, val)

			return member.send(`To prove your not a dastardly robot, please type this \`auth ${val}\``)
			.catch((err) => { throw err });
		}
		else{
			console.log(member.id)
			// this means it is not a guild member message but a dm
			console.log(`User ${member.username} needs to be verified! Added them to the unauthed list.`);
			
			setAuthKey(member.id, val)

			return member.send(`To prove your not a dastardly robot, please type this \`auth ${val}\``)
			.catch((err) => { throw err });
		}
		
	}
	catch(e){
		console.error(e);
	}
	
}

export async function checkVerification(user: User, message: Message){
	try{
		const capchaSent = message.content.split(' ')[1]?.trim()
		console.log(user.id)
		const capchaStored = await getAuthKey(user.id)
		if(capchaSent === capchaStored){
			// successful auth
			console.log(`user verified`);
			try{
				await delAuthKey(user.id);
				const role = findRoleByName('Verified')
				const guilds = client.guilds.cache.array()
				let member: GuildMember;
				for(let guild of guilds){
					const mem = guild.member(user.id)
					if(mem){ 
						member = mem;
						break;
					}
					else member = guild.ownerID === user.id ? guild.owner : mem
				}
				
				
				
				if(member){
					console.log(`Member ${member.user.username} has been verified!`)
					addRoleToUser(role.id, member)
					message.react(`${emoji.emoji.thumbsup}`)
					message.reply(`**You have been __authorized!__**\n\nWelcome to the server, not a robot! Make sure you read the rules and info of the server! If you need a list of commands, just message me \`help\` or use the \`!help\` command in the discord. My prefix for commands is \`!\`.`)
				}
				else{
					console.log(`User ${user.username} does not exist in the guild. Verification Failed!`)
				}
			}catch(err){
				console.error(err)
			}
			
		}else{
			console.log(`capcha failed`, capchaSent, capchaStored)
			message.react(`${emoji.emoji.thumbsdown}`)
			message.reply('That wasn\'t the right code.')
		}
	}catch(err){
		console.log(err)
	}
}

client.on('guildMemberAdd', sendVerification);

export function initVerification() {
	pushMessageFunction( (msg) => {
		if(msg.content.includes('verify')){
			const user = msg.member || msg.author;
			sendVerification(user);
		}
	})
	pushDMFunction( (msg) => {
		if(msg.content.startsWith('auth')){
			const user = msg.author;
			checkVerification(user, msg);
		}
	})
}