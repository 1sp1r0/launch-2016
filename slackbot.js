var chalk = require('chalk');
var firebase = require('firebase');
var firebaseReference = new firebase('https://launch2016.firebaseio.com/teams');

var startedBots = [];

var runBot = function(teamtoken){

	var Botkit = require('botkit');
	var controller = Botkit.slackbot();

	var bot = controller.spawn({
	  token: teamtoken
	}).startRTM(function(error, bot, payload){

		// console.log(JSON.stringify(payload, null, 2));

	});

	controller.hears(["hi"], 'direct_message,direct_mention,mention', function(bot, message){

		console.log(JSON.stringify(message, null, 2));
	  	bot.reply(message, "hi you!");

	});

	controller.hears(['huddle'], 'direct_message,direct_mention', function(bot, message){

		console.log(message);

		bot.reply(message, 'setting up huddle. I\'ll update you when it\'s ready');
		var users = message.text.match(/\b((?!=\<)\w+(?=\>))\b/gi);

		var initiator = message.user;

		users.forEach(function(user){

			var newMessage = message;
			newMessage.user = user;
		
			var converastation = bot.startPrivateConversation(newMessage,function(err,dm) {

		    	if(err){

		    		console.log(err);

		    	} else {

		    		var responses = [
		    			{
				    		pattern: 'no',
				    		callback: function(res, conv){
				    			conv.say('Okie Dokie?');
				    			message.user = initiator;
				    			message.text = [user, " rejected invite."].join(" ")
				    			bot.say(message);
				    			conv.next();
				    		},
		    			},
		    			{
		    				pattern: 'yes',
		    				callback: function(res, conv){
		    					conv.say("Cool, See you then.");
		    					message.user = initiator;
		    					message.text = [user, " accepted invite."].join(" ");
		    					bot.say(message);
		    					conv.next();
		    				}	
		    			}
		    		];

		    		var convo = dm.ask([message.user, " is asking if you meet today? Please reply with a 'yes' or 'no'"].join(" "), responses);

		    	}

		  	});



		});

	});

	controller.on('slash_command',function(bot, message) {

	    // reply to slash command
	    bot.replyPublic(message,'Everyone can see this part of the slash command');
	    bot.replyPrivate(message,'Only the person who used the slash command can see this.');

	})

};

var runBots = function(){
	
	firebaseReference.once('value', function(snapshot){

		var teams = snapshot.val();

		if(teams){
			
			for(var team in teams){

				if(teams[team].bot && teams[team].bot.bot_access_token){
					
					console.log("Starting Bot for", chalk.bold.cyan(teams[team].team_name));
					// if(startedBots.indexOf(team) < 0) {

						// startedBots.push(team);
						runBot(teams[team].bot.bot_access_token);
					// }

					
				} else {

					console.error(chalk.red(team), "was saved incorrectly.");

				}
			
			}
		
		}

	});

};

module.exports.runBot = runBot;
module.exports.runBots = runBots;