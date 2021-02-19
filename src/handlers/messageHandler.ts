import { Channel, Message, MessageEmbed, MessageEmbedOptions, MessageOptions, TextChannel } from 'discord.js';
import { client } from '../client'
import { findTextChannel } from '../helper';
interface MsgEmbedOptions extends MessageEmbedOptions {
	everyone: boolean;
	urlInContent: boolean;
	type: "rich" | "image" | "video" | "gifv" | "article" | "link"
}
interface MsgOptions {
	everyone: boolean;
	urlInContent: boolean;
	url: string;
	title: string;
}
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

export function sendMessage(channel: TextChannel | string, msg: string, options?: Partial<MsgOptions>){
	const chnl = findTextChannel(channel)
	chnl.send(<MessageOptions>{
		content: `${options.everyone ? '@here' : ''} \n${options.title ? '**' + options.title + '**' : ''}\n${options.urlInContent ? options.url : ''}\n*${msg}*\n`,
	});
}

export function sendEmbededMessage(channel: TextChannel | string, msg: string, options: Partial<MsgEmbedOptions>){
	const chnl = findTextChannel(channel)
	
	const embed_msg = new MessageEmbed({
		title: options.title || 'Announcement',
		description: msg,
		color: options.color || 0xFCA311,
		url: options.url,
		type: options.type || 'link'
	});
	
	chnl?.send(<MessageOptions>{
		embed: embed_msg,
		content: `${options.everyone ? '@here' : ''} ${options.urlInContent ? options.url : ''}`,
		
	});
}

export function sendError(channel: TextChannel){
	const embed_msg = new MessageEmbed({
		title: 'Incorrect Syntax',
		description: 'I expected some format and you did not follow it :(',
		color: 0xFF0000,
		fields: [
			{name: 'Expected', value: `%announce <low|med|high|crit> <message>`},
		]
		
	});
	
	channel.send(embed_msg);
}