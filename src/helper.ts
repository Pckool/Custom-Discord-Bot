// various helper functions
import fs from 'fs'

// function checkSaveFile(){
// 	try{
// 		data = JSON.parse( fs.readFileSync(`${__dirname}/data.json`) );
// 		if(data.saveMessage.id != ""){
// 			guild_channels.forEach((el) => {
// 				if(el.name === "role-assignment" && el.type === "text"){
// 					el.fetchMessage(data.saveMessage.id)
// 					.then(message => {
// 						currentPost = message;
// 						console.log('Found my old post...');
// 						addReactionEvents();
// 					})
// 					.catch(console.log);
// 				}
// 			});
			
// 		}
		
// 	}
// 	catch(e){
// 		console.log(`There was a problem retrieving the save file\n${e}`);
// 	}
// 	if(data.user_verification){
// 		unauthed_users = getFromSaveFile('user_verification');
// 		//console.log(JSON.stringify(unauthed_users, undefined, 2));
// 	}
// 	if(!unauthed_users){
// 		console.log(`There was a problem retrieving the unauthed users from the save file\nERROR: ${e}`);
// 	}
// }

// function setToSaveFile(name, dataToAppend){
// 	try{
// 		data = JSON.parse( fs.readFileSync(`${__dirname}/data.json`) );
// 		data[name] = dataToAppend;
// 		fs.writeFileSync(`${__dirname}/data.json`, JSON.stringify(data) );
		
// 	}
// 	catch(e){
// 		console.log(`There was a problem retrieving or saving the save file\n${e}`);
// 	}
// }

// function remFromSaveFile(name){
// 	try{
// 		data = JSON.parse( fs.readFileSync(`${__dirname}/data.json`) );
// 		data[name] = undefined;
// 		fs.writeFileSync(`${__dirname}/data.json`, JSON.stringify(data) );
		
// 	}
// 	catch(e){
// 		console.log(`There was a problem retrieving or saving the save file\n${e}`);
// 	}
// }
// function getFromSaveFile(name){
// 	try{
// 		data = JSON.parse( fs.readFileSync(`${__dirname}/data.json`) );
// 		return data[name];
		
// 	}
// 	catch(e){
// 		console.log(`There was a problem retrieving or saving the save file\n${e}`);
// 		return undefined;
// 	}
// }