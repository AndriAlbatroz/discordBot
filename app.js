var Discord = require('discord.js');
var ytdl = require('ytdl-core');

const client = new Discord.Client();
const streamOptions = {seek: 0, volume: 1};

var info = require('./auth.json');

client.login(info.token);

client.on('ready', err => {
	if(err) throw err;
	console.log('Connesso');
});

client.on('message', msg => {
	if(msg.content === '!help') {
		msg.reply(
			"\nBenvenuto in questo server di merda, COGLIONE\n" + 
			"Sai che sei gay e per questo mi hai chiesto AIUTO!\n" +
			"Detto ciò, ecco quello che puoi fare con me: \n"  +
			"[-] !calc y=x+1 - Per usare le funzionalità di wolframAlpha\n" +
			"[-] !sfolla     - Per farmi sfollare a caso\n" + 
			"[-] !connect    - Per connetersi ad un canale vocale\n" + 
			"Per adesso solo questo.. ma ci stiamo lavorando."
		);
	}

	if(msg.content == '!connect') {
		for(var obj of client.channels) {
			for(var ob of obj) {
				console.log(ob.guild.channels);
			}
		}
	}
});
