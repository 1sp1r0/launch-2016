
module.exports.runBot = function(teamtoken){

	var bot = controller.spawn({
	  token: teamtoken
	}).startRTM();

	controller.hears(["hi"], 'direct_message,direct_mention,mention', function(bot, message){

		console.log(JSON.stringify(message, null, 2));
	  	bot.reply(message, "hi you!");

	});

};

module.exports.runBots = function(){

	var chalk = require('chalk');
	var Botkit = require('botkit');
	var firebase = require('firebase');
	var controller = Botkit.slackbot();

	var firebaseReference = new firebase('https://launch2016.firebaseio.com/teams')

	firebaseReference.on('value', function(snapshot){

		var teams = snapshot.val();

		if(teams){
			
			for(var team in teams){

				if(teams[team].bot && teams[team].bot.bot_access_token){
					
					console.log("Starting Bot for", chalk.bold.cyan(teams[team].team_name));
					runBot(teams[team].bot.bot_access_token);
					
				
				} else {

					console.error(chalk.red(team), "was saved incorrectly.");

				}
			
			}
		
		}

	});

};