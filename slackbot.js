module.exports = function(){
	
	var Botkit = require('botkit');
	var firebase = require('firebase');
	var controller = Botkit.slackbot();

	var firebaseReference = new firebase('https://launch2016.firebaseio.com/teams')

	firebaseReference.on('value', function(snapshot){

		for(var team in snapshot.val()){

			console.log(team)

			var bot = controller.spawn({
			  token: team.bot.bot_access_token
			}).startRTM();

			controller.hears(["hi"], 'direct_message,direct_mention,mention', function(bot, message){

			  	bot.reply(message, "hi you!");

			});


		}

	});

};