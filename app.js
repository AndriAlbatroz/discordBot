var Discord = require('discord.js');
var ytdl = require('ytdl-core');
var fs = require('fs');
var youtube = require('youtube-node');
var jsonfile = require('jsonfile');

const client = new Discord.Client();
const streamOptions = {seek: 0, volume: 1};
const yt = new youtube();

var info = require('./auth.json');
var initYT = 'http://www.youtube.com/watch?v=';

yt.setKey(info.ytAPI);

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
			"[-] !leave      - Per disconnetersi da una stanza vocale\n" +
			"Per adesso solo questo.. ma ci stiamo lavorando."
		);
	}

	if(msg.content === '!connect') {
		var channel = msg.member.voiceChannel;
		channel.join().then( () => {
			console.log('Entrato nel canale' + " " + channel)
		}).catch(console.error);
	}

	if(msg.content == '!leave') {
		var channel = msg.member.voiceChannel;
		channel.leave();
	}

	if(msg.content.startsWith('!play ')) {
		var title = msg.content.replace('!play ','');
		var videoID;
		yt.search(title, 2, (err,res) => {
			if(err) throw err;
			jsonfile.writeFile('prova.json',res,'utf8', err => {
				if(err) throw err;
			});
			for(var key in res.items) {
				if(res.items[key].id.kind == 'youtube#video') {
					if(videoID == null) {	
						videoID = res.items[key].id.videoId;
						break;
					}
				}
			}
			var URL = initYT + videoID;
			ytdl(URL).pipe(fs.createWriteStream('prova.mp3'));
		});
	}

});
