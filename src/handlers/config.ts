import fs from 'fs';
import path from 'path';
import {TheatreData} from './../interfaces'

interface ConfigData {
	theatre_data: TheatreData,

}

const configDir = path.join(__dirname, './../../conf');
export const configFile = path.join(configDir, 'bot.json');

export function getConfig(): ConfigData{
	try{
		console.log('retrieving config...')
		const exConf = fs.readFileSync(configFile, {encoding: 'utf-8'})
		return <ConfigData>JSON.parse(exConf);
	}
	catch(err){
		console.log('Config doesn\'t exist...')
		return <ConfigData>{}
	}
}
export function saveToConfig(data: ConfigData){
	console.log('saving config...')
	const conf = getConfig()
	for(let key of Object.keys(data))
	conf[key] = { ...conf[key], ...data[key] }
	
	fs.writeFileSync(configFile, JSON.stringify(conf), {encoding: 'utf-8'})
}
export function getConfigProp(prop: keyof ConfigData): TheatreData | null { 
	const conf = getConfig();
	
	if(conf[prop]){ return conf[prop] }
	else { return null }
}
