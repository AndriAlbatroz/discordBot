var info = require('./config.json');

var Discord = require('discord.js');
var ytdl = require('ytdl-core');
var fs = require('fs');
var youtube = require('youtube-node');
var jsonfile = require('jsonfile');
var wolfram = require('wolfram-alpha');
var speedTest = require('speedtest-net');

const lolapi = require('lolapi')(info.apiKey.lolAPI, info.lolConf.region);

const client = new Discord.Client();
const streamOptions = {seek: 0, volume: 1};
const yt = new youtube();
const test = speedTest({maxTime : 5000});

//Variabile per stremmare su un canale vocale, gli viene associato un'oggeto al momento della connessione ad um canale vocale
var connection;
var connected;

//Variabile per la crezione del link per acquisire il video su YT, poiche la ricerca mi ritorna semplicemente l'id del video, che va aggiunto a questa varibile per andare a comporre il link del video su YT
var initYT = 'http://www.youtube.com/watch?v=';

//Setto l'API per la ricerca personalizzata di google per YT
yt.setKey(info.apiKey.ytAPI);

var wolf = wolfram.createClient(info.apiKey.wolframAPI, (err) => {
	if(err) throw err;
});

//Faccio l'accesso al server tramite il token dell'applicazione bot
client.login(info.login.token);

//Evento che mi indica quando il bot è pronto
client.on('ready', err => {
	if(err) throw err;
});

//Evento che si avvia quando viene scritto un messaggio nella chat generale
client.on('message', msg => {

	//Vado a leggere il messaggio e se è uguale a quelli preimpostati esegue delle azioni, in questo caso stampo nella chat la lista di tutti i comandi
	if(msg.content === '!help') {
		msg.reply(
			"\nBenvenuto in questo server di merda, COGLIONE\n" +
			"Sai che sei gay e per questo mi hai chiesto AIUTO!\n" +
			"Detto ciò, ecco quello che puoi fare con me: \n"  +
			"[-] !calc y=x+1 - Per usare le funzionalità di wolframAlpha\n" +
			"[-] !sfolla     - Per farmi sfollare a caso\n" +
			"[-] !join    - Per connetersi ad un canale vocale\n" +
			"[-] !leave      - Per disconnetersi da una stanza vocale\n" +
			"[-] !play title - Per streammare nel canale vocale una canzone\n" +
			"[-] !game summonerName - Per prendere le info sul game in corso\n" +
			"Per adesso solo questo.. ma ci stiamo lavorando."
		);
	}

	//In questo caso vado a connetermi nel canale vocale dove è presente l'utente che ha digitato il comando connect
	if(msg.content === '!join') {
		try {
			var channel = msg.member.voiceChannel;
			channel.join().then( (con) => {
				connection = con;
				msg.reply('Entrato nel canale: ' + channel);
				connected = true;
			}).catch(console.error);
		} catch(err) {
			msg.reply(err + '\n Errore nella connessione, prova ad unirti ad una stanza vocale e poi ridigita il comando!');
		}
	}

	//Qui invece esco dal canale vocale
	if(msg.content === '!leave') {
		try {
			var channel = msg.member.voiceChannel;
			channel.leave();
			connected = false;
		} catch(err) {
			msg.reply(err + '\n Errore nella disconessione, prova ad unirti nella stanza dove cè il bot e poi ridigita il comando');
		}
	}

	//Stremmo la parte audio di un qualsiasi video presente su YT
	if(msg.content.startsWith('!play ')) {
		if(connected) {
			var title = msg.content.replace('!play ','');
			var videoID;
			yt.search(title, 2, (err,res) => {
				if(err) throw err;
				for(var key in res.items) {
					if(res.items[key].id.kind == 'youtube#video') {
						if(videoID == null) {
							videoID = res.items[key].id.videoId;
							break;
						}
					}
				}
				var URL = initYT + videoID;
				var streamer = ytdl(URL, {filter : 'audioonly'});
				connection.playStream(streamer, info.streamConf	);
				msg.reply('In esecuzione: ' + res.items[key].snippet.title);
			});
		} else {
			msg.reply('Fammi prima entrare in un canale vocale!');
		}
		return;
	}

	if(msg.content.startsWith('!calc ')) {
		var func = msg.content.replace('!calc','');
		wolf.query(func,(err,res) => {
			if(err) throw err;
			for(var key in res) {
				res[key].subpods.forEach(data => {
					msg.reply(JSON.stringify(res[key].title,null,2) + '=' + JSON.stringify(data.text,null,2));
					msg.reply('\n' + JSON.stringify(data.image,null,2));
				});
			}
		});
	}

	if(msg.content === '!speed') {
		test.on('data',data => {
			msg.reply(JSON.stringify(data,null,2));
		});
	}

	if(msg.content.startsWith('!game')) {
		var sumName = msg.content.replace('!game ','');
		var id_;

		var options = {
  		useRedis: true,
  		hostname: '127.0.0.1',
  		port: 6379,
  		cacheTTL: 7200,
		};

		lolapi.Summoner.getByName(sumName, (err,res) => {
			if(err) throw err;
			for(var key in res) {
				id_ = res[key].id;
			}
			lolapi.CurrentGame.getBySummonerId(parseInt(id_),options,(err,response) => {
				try {
					if(response == null) {
						msg.reply('Il giocatore non è in partita');
					} else {
						msg.reply(JSON.stringify(response,null,2));
					}
				} catch(error) {
					console.log(error);
				}
			});
		});
	}

});
