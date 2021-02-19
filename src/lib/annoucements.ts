// Handles announcing messages to all players who should receive them

import { client } from "../client";
import { pushDMFunction, pushGMFunction, pushMessageFunction, sendEmbededMessage, sendMessage } from "../handlers/messageHandler";
import emoji from 'node-emoji'
import { basicPermissionError } from "../helper";

export function initAnnouncements(){
	const guilds = client.guilds.cache.array()
	guilds[0].channels.cache.array().forEach(channel => {
		console.log(`${channel.name}: ${channel.id}`);
	})
	pushGMFunction( (msg) => {
		try{
			if(msg.content.startsWith('!announce ')){
				if(!client.guilds.cache.array().find(guild => guild.ownerID === msg.author.id)) throw basicPermissionError
				const messageSplit = msg.content.split(' ')
				
				sendMessage('811417859904372806', messageSplit.slice(1).join(' '), {
					everyone: false
				});
			}

			else if(msg.content.startsWith('!announce-stream ')){
				if(!client.guilds.cache.array().find(guild => guild.ownerID === msg.author.id)) throw basicPermissionError
				const messageSplit = msg.content.split(' ')
				
				sendMessage('811421682304417833', messageSplit.slice(1).join(' '), {
					everyone: false,
					url: 'https://twitch.tv/tdefton',
					urlInContent: true,
					title: 'NEW STREAM'
				});
				msg.react(emoji.get('thumbsup'))
			}

			else if(msg.content.startsWith('!announce-video ')){
				if(!client.guilds.cache.array().find(guild => guild.ownerID === msg.author.id)) throw basicPermissionError

				const messageSplit = msg.content.split(' ')
				
				const link = /^(https:\/\/)(.)+/g.test(messageSplit[1]) ? messageSplit[1] : null;

				if(link){
					sendMessage('811421729305264208', messageSplit.slice(2).join(' '), {
						everyone: false,
						url: messageSplit[1],
						urlInContent: true,
						title: 'NEW VIDEO'
					});
					msg.react(emoji.get('thumbsup'))
				}
				else{
					throw new Error(`The link you gave is invalid ${emoji.emoji.disappointed}`)
				}
			}
		} catch(err){
			console.error(err)
			msg.react(emoji.get('thumbsdown'))
			if(err.message) msg.reply(err.message)
		}
		
	})
	
}
