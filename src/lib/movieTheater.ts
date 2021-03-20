import { client, guild } from "../client";
import {emoji} from 'node-emoji';
import {getConfigProp, saveToConfig, configFile} from './../handlers/config'
import {TheatreData} from './../interfaces'
import { GuildChannel, GuildChannelResolvable, TextChannel } from "discord.js";

const theatre: TheatreData = {
	categoryId: '',
	chatId: '',
	voiceId: ''
}
const enjoyLines = [
	'Enjoy the film!',
	`Hope you brought snacks ${emoji.pizza}`,
	`Don't spill your drink ${emoji.angry}`,
	`Have fun!`,
	`Woot Woot!`
]

const getEnjoyLine = () => enjoyLines[Math.floor(enjoyLines.length * Math.random())];
export async function createTheatre(){
	const cat = await createCat();
	await createChat(cat)
	await createVoice(cat)
	saveTheatre()
}

async function createCat(){
	const cat = await guild.channels.create(`Watch Together! ${ emoji.clapper }`, {
		type: 'category',

	});
	theatre.categoryId = cat.id;
	return cat;
}

async function createChat(cat: GuildChannelResolvable){
	const chat = await guild.channels.create(`${ emoji.movie_camera }theater-chat`, {
		type: 'text',
		parent: cat,

	});
	theatre.chatId = chat.id
	return chat;
}

async function createVoice(cat: GuildChannelResolvable){
	const voice = await guild.channels.create(`${ emoji.popcorn } Theater`, {
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
		console.log('voice state update', old.channelID, curr.channelID)
		if(curr.channelID === theatre.voiceId && curr.channelID !== old.channelID){
			const chan = guild.channels.resolve(theatre.chatId)
			if(chan.type === 'text'){
				(chan as TextChannel).send(`<@${curr.member.id}> walked into the movie theater! ${getEnjoyLine()}`)
				// (chan as TextChannel).send(`**curr.member.username** walked into the movie theater! ${getEnjoyLine()}`)
			}
		}
	})
}

export function initTheatre(){
	// console.log(configFile);
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
		
	}
	else{
		createTheatre()
	}
	watchChatChannel()
}
