var express = require('express');
var router = express.Router();

var http = require('http');
var https = require('https');
var querystring = require('querystring');

var Botkit = require('botkit');
var controller = Botkit.slackbot();

var SLACK_CLIENT_STATE = "inn-launch2016";
var SLACK_CLIENT_ID = '23387650483.23407311957';
var SLACK_CLIENT_SECRET = 'b2648544f13c22178945dc74f18f3bcd';

var ACCESS_TOKEN = { ok: true,
  access_token: 'xoxp-23387650483-23390422928-23414077058-fc2fdd74fb',
  scope: 'identify,commands,channels:read,groups:read,team:read,users:read,usergroups:read,channels:write,chat:write:user,chat:write:bot,groups:write,bot',
  team_name: 'The Genial Schemer Workshop',
  team_id: 'T0PBDK4E7',
  bot: 
   { bot_user_id: 'U0PC6SW6M',
     bot_access_token: 'xoxb-23414914225-5z3ZNMJPJtHOJQRlJkXFffMC' } };

var REDIRECT_URI = 'http://104.154.83.36/slack/oauth';

var request = function(method, options, callback){

	var slackrequest = https.request(options, function(slackresponse){
		
		var body = '';
		slackresponse.setEncoding('utf-8');
		slackresponse.on('data', function(data){	
			body += data;
		});

		slackresponse.on('end', function(){
			
			var json = null;

			try {

				json = JSON.parse(body);

			} catch(e){

				console.error(method, e);
				return callback(e);

			}

			return callback(null, json);

		});

		slackresponse.on('error', function(error){

			console.error(method, 'Error', error);
			return callback(error);

		});

	});

	return slackrequest.end();

};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Huddle', content: 'Welcome to huddle' });
});

router.get('/slack', function(req, res, next){
	
	var query = querystring.stringify({
		client_id: SLACK_CLIENT_ID,
		client_secret: SLACK_CLIENT_SECRET,
		redirect_url: REDIRECT_URI,
		state: SLACK_CLIENT_STATE,
		scope: [
			'bot',
			'commands',
			'chat:write:user',
			'chat:write:bot',
			'channels:read',
			'channels:write',
			'groups:write',
			'groups:read',
			'team:read',
			'usergroups:read',
			'users:read'
		].join()
	});
	
	res.redirect(['https://slack.com/oauth/authorize', query].join("?"));	

});

router.get('/slack/oauth', function(req, res){

	if(req.query.code && req.query.state === SLACK_CLIENT_STATE){
		
		console.log("\n\nQUERY\n", req.query);
		
		var query = querystring.stringify({
			client_id: SLACK_CLIENT_ID,
            client_secret: SLACK_CLIENT_SECRET,
			code: req.query.code,
			redirect_url: REDIRECT_URI
		});
		
		var options = {
			method: 'GET',
			hostname: 'slack.com',
			path: ['/api/oauth.access', query].join("?")
		};
		
		request("[/slack/oauth]", options, function(error, body){

			var content = {
				title: 'Huddle', 
				content: "Installed Successfully!"
			};

			if(error) content.content = "Failed to Install :(";
			else ACCESS_TOKEN = body;
			
			return res.render('index', content);

		});

	}
	
});

router.get('/slack/rtm', function(req, res){

	var bot = controller.spawn({
		token: ACCESS_TOKEN.bot.bot_access_token
	});

	bot.startRTM(function(error, bot, payload){

		if(error){

			return console.error("[/slack/rtm] Couldn't connect to the client because: ", error);

		}

		controller.hears(["hi"], ['direct_message' , 'direct_mention' , 'mention'], function(bot, message){

			bot.startConversation(message, function(err, converstaion){


				if(error){

					return console.error("[/slack/rtm] Error ", error);

				}

				converstaion.say("YO, what's up!");

			});

		})


	});

});

module.exports = router;
