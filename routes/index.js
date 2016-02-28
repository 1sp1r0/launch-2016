var express = require('express');
var router = express.Router();

var http = require('http');
var https = require('https');
var querystring = require('querystring');

var SLACK_CLIENT_STATE = "inn-launch2016";
var SLACK_CLIENT_ID = '23387650483.23407311957';
var SLACK_CLIENT_SECRET = 'b2648544f13c22178945dc74f18f3bcd';

var ACCESS_TOKEN = null;
var REDIRECT_URI = 'http://104.154.83.36/slack/oauth';

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

					console.error('[/slack/oauth]', e);
										
				}

				ACCESS_TOKEN = json;
				var content = {
					title: 'Huddle', 
					content: "Installed Successfully!"
				};
				
				return res.render('index', content);

			});

			slackresponse.on('error', function(error){

				console.error('[/slack/oauth/] Error', error);

			});

		});

		return slackrequest.end();

	}
	
});

router.get('/slack/rtm', function(req, res){

	var query = querystring.stringify({
		token: ACCESS_TOKEN.bot.bot_access_token
	}):

	var options = {
		method: 'GET',
		hostname: 'slack.com',
		path: '/api/rtm.start'
	};
		
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

				console.error('[/slack/rtm]', e);
									
			}

			console.log("\n\n", body, "\n\n");

		});

		slackresponse.on('error', function(error){

			console.error('[/slack/rtm/] Error', error);

		});

	});

	return slackrequest.end();

});

module.exports = router;
