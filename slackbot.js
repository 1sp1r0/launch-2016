module.exports = function(){

	var chalk = require('chalk');
	var Botkit = require('botkit');
	var firebase = require('firebase');
	var controller = Botkit.slackbot();

	var firebaseReference = new firebase('https://launch2016.firebaseio.com/teams')

	firebaseReference.on('value', function(snapshot){

		var teams = snapshot.val();

		if(teams.length > 0){
			
			for(var team in snapshot.val()){

				console.log("Starting Bot for", chalk.bold.cyan(teams[team].team_name));

				var bot = controller.spawn({
				  token: team.bot.bot_access_token
				}).startRTM();

				controller.hears(["hi"], 'direct_message,direct_mention,mention', function(bot, message){

					console.log(JSON.stringify(message, null, 2));
				  	bot.reply(message, "hi you!");

				});


			}

		}

	});

};