// Handles announcing messages to all players who should receive them

import { client } from "../client";
import { pushDMFunction, pushGMFunction, pushMessageFunction, sendEmbededMessage, sendMessage } from "../handlers/messageHandler";
import {getConfigProp, saveToConfig, savePropToConfig} from './../handlers/config'
import emoji from 'node-emoji'
import { basicPermissionError } from "../helper";
import { AnnouncementData } from "../interfaces";

const announcementChannels: AnnouncementData = {
	general_id: '811417859904372806',
	event_id: '811428311119953930',
	stream_id: '811421682304417833',
	video_id: '811421729305264208'
}

export function postEvent(message: string, ts?: Date | number){
	const eventChannel = announcementChannels.event_id

	sendMessage(eventChannel, message, {
		everyone: true,
		title: '__EVENT__'
	});
}

export function postAnnouncement(message: string){
	const eventChannel = announcementChannels.general_id

	sendMessage(eventChannel, message, {
		everyone: true,
		title: '__EVENT__'
	});
}
export function postStream(message: string){
	const streamChannel = announcementChannels.stream_id
	const url = 'https://twitch.tv/tdefton'
	sendMessage(streamChannel, message, {
		everyone: true,
		url,
		urlInContent: true,
		title: '__WE\'RE LIVE__'
	});
}

export function postYTVideo(message: string, url: string){
	const videoChannel = announcementChannels.video_id
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
	console.log(`Initializing announcements engine...`)
	savePropToConfig('announcement_data', announcementChannels)
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
