// a rest endpoint to be sued by the (web frontend in the future)
import express from 'express';
const server = express();
const port = process.env.PORT

export function startServer() {
	server.get('/dis_bot', function(req, res) {
		// res.send(req.query)
	});
	// server.get('/dis_bot/guild', function(req, res){
	// 	res.send(guild);
	// });
	// server.get('/dis_bot/guild/members', function(req, res) {
	// 	let mems = {};
	// 	guild_members.forEach((el, i) => {
	// 		mems[i] = {
	// 			username: el.username,
	// 			id: el.id
	// 		};
	// 	});
	// 	res.send(mems);
	// });
	// server.get('/dis_bot/guild/channels', function(req, res) {
	// 	res.send(guild_channels.array());
	// });
	// server.get('/dis_bot/guild/emojis', function(req, res) {
	// 	res.send(guild_emojis.array());
	// });
	// server.get('/dis_bot/guild/emoji_catalog', function(req, res) {
	// 	res.send(emoji_catalog);
	// });
	// server.get('/dis_bot/restart', function (req, res) {
	// 	discordLogin(err => {
	// 		if(err){
	// 			res.sendStatus(500);
	// 		}
	// 		else{
	// 			res.sendStatus(200);
	// 		}
			
	// 	})
		
	// });
	// server.get('/users/unauthed', function(req, res){
	// 	res.send(`${JSON.stringify(unauthed_users, undefined, 2)}`);
	// });


	// server.get('/users/unauthed', function (req, res) {
	// 	res.send(`${JSON.stringify(unauthed_users, undefined, 2)}`);
	// });

	server.listen(port, () => { 
		console.log(`Express server listening on port ${port}...`);
	});
}
