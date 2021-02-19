import {Client} from 'discord.js';
const client = new Client();
const token = process.env.DISCORD_TOKEN;

export async function login(){
	if(!token) {
		throw new Error('No token available!')
	} 
	const returnedToken = await client.login(token);
	if(returnedToken){
		return;
	}
}
export async function start() {
	try{
		await login()
		await client.guilds.cache.array().forEach(guild => {
			const gid = guild.id
			if(gid){
				// console.log(`${gid}: ${guild.name}`);
			}
		});
	} catch(err){
		console.error(err)
		process.exit(1);
	}
	
}

export {
	client
};