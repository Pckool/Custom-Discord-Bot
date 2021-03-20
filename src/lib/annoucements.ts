// Handles announcing messages to all players who should receive them

import { client } from "../client";
import { pushDMFunction, pushGMFunction, pushMessageFunction, sendEmbededMessage, sendMessage } from "../handlers/messageHandler";
import emoji from 'node-emoji'
import { basicPermissionError } from "../helper";

export function postEvent(message: string, ts?: Date | number){
	const eventChannel = '811428311119953930'

	sendMessage(eventChannel, message, {
		everyone: true,
		title: '__EVENT__'
	});
}

export function postAnnouncement(message: string){
	const eventChannel = '811428311119953930'

	sendMessage(eventChannel, message, {
		everyone: true,
		title: '__EVENT__'
	});
}
export function postStream(message: string){
	const streamChannel = '811428311119953930'
	const url = 'https://twitch.tv/tdefton'
	sendMessage(streamChannel, message, {
		everyone: true,
		url,
		urlInContent: true,
		title: '__WE\'RE LIVE__'
	});
}

export function postYTVideo(message: string, url: string){
	const videoChannel = '811421729305264208'
	const link = /^(https:\/\/)(.)+/g.test(url) ? url : null;
	if(link){
		sendMessage(videoChannel, message, {
			everyone: true,
			url: message,
			urlInContent: true,
			title: 'NEW VIDEO'
		});
	}
	else{
		throw new Error(`The link you gave is invalid ${emoji.emoji.disappointed}`)
	}
}

export function initAnnouncements(){
	const guilds = client.guilds.cache.array()
	guilds[0].channels.cache.array().forEach(channel => {
		console.log(`${channel.name}: ${channel.id}`);
	})
	pushGMFunction( (msg) => {
		try{
			if(msg.content.startsWith('!announce ')){
				if(!client.guilds.cache.array().find(guild => guild.ownerID === msg.author.id)) throw basicPermissionError;
				const messageSplit = msg.content.split(' ')
				
				postAnnouncement(messageSplit.slice(1).join(' '));
				msg.react(emoji.get('thumbsup'))
			}

			else if(msg.content.startsWith('!announce-event ')){
				if(!client.guilds.cache.array().find(guild => guild.ownerID === msg.author.id)) throw basicPermissionError;
				const messageSplit = msg.content.split(' ')
				
				postEvent(messageSplit.slice(1).join(' '));
				msg.react(emoji.get('thumbsup'))
			}

			else if(msg.content.startsWith('!announce-stream ')){
				if(!client.guilds.cache.array().find(guild => guild.ownerID === msg.author.id)) throw basicPermissionError;
				const messageSplit = msg.content.split(' ')
				
				postStream(messageSplit.slice(1).join(' '));
				msg.react(emoji.get('thumbsup'))
			}
			
			else if(msg.content.startsWith('!announce-video ')){
				if(!client.guilds.cache.array().find(guild => guild.ownerID === msg.author.id)) throw basicPermissionError;

				const messageSplit = msg.content.split(' ')
				postYTVideo(messageSplit.slice(2).join(' '), messageSplit[1]);
				msg.react(emoji.get('thumbsup'))

			}
		} catch(err){
			console.warn(err.message)
			msg.react(emoji.get('thumbsdown'))
			if(err.message) msg.reply(err.message)
		}
		
	})
	
}
