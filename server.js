'use strict';

const express = require('express');
const app = express();
const sslRedirect = require('heroku-ssl-redirect');
const request = require('request');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const user = require('./models/user');
mongoose.connect('mongodb://sumedh:sumedh@ds147480.mlab.com:47480/pushservice');


app.use(sslRedirect());
app.use(express.static(__dirname + '/public'));
app.use(bodyparser.urlencoded({ extended : true }));
app.set('view engine', 'ejs');
const PORT = process.env.PORT || 5000;

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://pushservicee.herokuapp.com");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
 });

app.get('/', function(req, res) {
	res.render('index');
});

app.post('/', function(req, res) {
	console.log(req.body.endpoint);
	let newSubscription = new user({
		'endpoint' : req.body.endpoint
	});
	newSubscription.save(function(err) {
		if(err)
			console.log(err);
		console.log('New Subscription Added');
	});
});

app.get('/sendNotification', function(req, res) {
	user.find({}, function(err, users) {
		users.forEach(function(user) {
			let registrationId = user.endpoint;
			registrationId = registrationId.substring(40);
			let dataString = '{"registration_ids":[' + '"'  + String(registrationId) + '"' + ']}';

			let options = {
			    url: 'https://fcm.googleapis.com/fcm/send',
			    method: 'POST',
			    headers : { "Content-Type" : "application/json", "Authorization" : "key=" + "AIzaSyDWNKAoi6RDVYaTPKHTCx0o_1HCvI1oeGI" },
			    body: dataString
			};

			function callback(error, response, body) {
			    if (!error && response.statusCode == 200) {
			        console.log('Notification sent');
			    }
			}

			request(options, callback);

		});
	});
	res.send('All notifications sent successfully.');
});

app.listen(PORT);
console.log('server listening to : ', PORT);	