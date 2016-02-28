var express = require('express');
var router = express.Router();

var http = require('http');
var chalk = require('chalk');
var https = require('https');
var firebase = require('firebase');
var slackbot = require('../slackbot');
var querystring = require('querystring');

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

router.get('/support', function(req, res, next) {

  res.render('support');

});

router.get('/instructions', function(req, res, next){

	res.render('instructions');

});

router.get('/instruction', function(req, res, next){

	res.render('support');

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

	var content = {
		title: 'Huddle', 
		content: "Installed Successfully! Hop into Slack and call up some huddles."
	};

	try {

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

				if(error) content.content = "Failed to Install huddle into the team. :(";
				else ACCESS_TOKEN = body;
				
				if(body && body.team_id && body.bot.bot_access_token){

					var huddleFirebase = new firebase('https://launch2016.firebaseio.com/teams');

					huddleFirebase.child(body.team_id).once('value', function(snapshot){

						if(!snapshot.exists() && body.team_id){

							// Create the firebase object to save the tokens for this particular team.
							huddleFirebase.child(body.team_id).set(body);
							
							// Start the bot for the newly added team.
							slackbot.runBot(body.bot.bot_access_token);

						} else {

							console.log(chalk.yellow(body.team_name), "team already exists!");
							content.content = "Your team already has Huddle integrated into Slack! Way to go!";
							res.render('base', content);
							return res.end();
						
						}

					});
				
				} else {

					console.log(body);
					console.log(chalk.red(req.url, "was used."));
					res.redirect('/');
					return res.end();

				}

				res.render('/success', content);
				return res.end();

			}.bind(this));		

		}

	} catch(e){

		console.log("[/slack/oauth] Exception raised", chalk.red(e));
		content.content = "Oh Man! Something's not right. Please try again later.";
		res.render('base', content);
		return res.end();

	}
	
});

router.get('/success', function(req, res, next){

	res.render('/base', res.content);

});

module.exports = router;
