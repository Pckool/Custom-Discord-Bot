import { client, guild } from "../client";
import emoji from 'node-emoji';
import {getConfigProp, saveToConfig} from './../handlers/config'
import {TheatreData} from './../interfaces'
import { GuildChannel, GuildChannelResolvable, TextChannel } from "discord.js";

const theatre: TheatreData = {
	categoryId: '',
	chatId: '',
	voiceId: ''
}
export async function createTheatre(){
	const cat = await createCat();
	await createChat(cat)
	await createVoice(cat)
	saveTheatre()
}

async function createCat(){
	const cat = await guild.channels.create(`Watch Together! ${ emoji.find(emoji.emoji.movie_camera) }`, {
		type: 'category',

	});
	theatre.categoryId = cat.id;
	return cat;
}

async function createChat(cat: GuildChannelResolvable){
	const chat = await guild.channels.create(`${ emoji.find(emoji.emoji.left_speech_bubble) }theater-chat`, {
		type: 'text',
		parent: cat,

	});
	theatre.chatId = chat.id
	return chat;
}

async function createVoice(cat: GuildChannelResolvable){
	const voice = await guild.channels.create(`${ emoji.find(emoji.emoji.popcorn) }Theater!`, {
		type: 'voice',
		parent: cat,

	});
	theatre.voiceId = voice.id
	return voice;
}

function saveTheatre(){
	saveToConfig({
		'theatre_data': theatre
	})
}

export function findTheatre(theatre: TheatreData){
	const category = guild.channels.resolve(theatre.categoryId)
	const chat = guild.channels.resolve(theatre.chatId)
	const voice = guild.channels.resolve(theatre.voiceId)
	return {
		category,
		chat,
		voice
	};
	
}

function watchChatChannel(){
	client.on('voiceStateUpdate', (old, curr) => {
		if(curr.channelID === theatre.voiceId && curr.channelID !== old.channelID){
			const chan = guild.channels.resolve(theatre.chatId)
			if(chan.type === 'text'){
				(chan as TextChannel).send(`@<${curr.member.id}> walked in the movie theatre! ${'Enjoy the popcorn!'}`)
			}
		}
	})
}

export function initTheatre(){
	const conf = getConfigProp('theatre_data')
	if(conf){
		Object.assign(theatre, conf);
		const theatreChannels = findTheatre(theatre)
		if(theatreChannels.category && theatreChannels.chat && theatreChannels.voice){

		}
		else{
			if(!theatreChannels.category){
				createCat()
			}
			if(!theatreChannels.chat){
				createChat(guild.channels.resolve(theatre.categoryId))
			}
			if(!theatreChannels.voice){
				createVoice(guild.channels.resolve(theatre.categoryId))
			}
		}
		watchChatChannel()
	}
	else{
		createTheatre()
	}
	
}
