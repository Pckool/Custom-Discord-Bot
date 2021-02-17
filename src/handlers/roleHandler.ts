import { Guild, GuildMember, Role } from "discord.js";
import { client } from "../client";

export function addRoleToUser(roleId: string, member: GuildMember){
	member.roles.add(roleId)
} 
export function findRoleByName(name: string){
	const guilds = client.guilds.cache.array();
	let role: Role
	for(let guild of guilds){
		const foundRole = guild.roles.cache.array().find((role) => role.name.includes(name))
		if(foundRole) {
			role = foundRole;
			break;
		}
	}
	return role;
}
export function findRolesByName(name: string){
	const guilds = client.guilds.cache.array();
	 
}