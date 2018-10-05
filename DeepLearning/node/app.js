/***********************
	[Require] 
		mongo, express, mongoose, body-parser, underscore
	npm install mongo
	npm install --save express mongoose body-parser
	npm install underscore

	[Directory]
	//head dir (~/node)
	app.js : connect with mongoDB docker containter by bridge inner network and DL Server(Host pc)
	|----models
		|---- rssi.js : Define DB schema (model)
	|----routes
		|---- index.js : CRUD (create, retrieve, update, delete) method, connect route

***********************/
// app.js

// [LOAD PACKAGES]
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');

var mongoIP = '172.18.0.2';
var mongoPort = '27017';
var port = process.env.PORT || 90;
var mongoDBName = 'DeepLearning';
// var mongoDB_Rssi_Name = 'DeepLearning_RSSI';
// var mongoDB_Current_Name = 'DeepLearning_CURRENT';

var mongoAddress = 'mongodb://' + mongoIP + ':' + mongoPort + '/' + mongoDBName;
// var mongoAddress_Rssi = 'mongodb://' + mongoIP + ':' + mongoPort + '/' + mongoDB_Rssi_Name;
// var mongoAddress_Current = 'mongodb://' + mongoIP + ':' + mongoPort + '/' + mongoDB_Current_Name;

// [CONFIGURE APP TO USE bodyParser]
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// [RUN SERVER]
var server = app.listen(port, function(){
	console.log("Express server has started on port " + port)
});
mongoose.connect(mongoAddress);

// [CONFIGURE ROUTER]
var PREDICT = require('./models/predict.js');
var RSSI_TEST = require('./models/rssi_test.js');
var CURRENT = require('./models/current.js');
var RSSI_REAL = require('./models/rssi_real.js');
var RSSI_STAY1 = require('./models/rssi_stay1.js');
var RSSI_STAY2 = require('./models/rssi_stay2.js');
var RSSI_STAY3 = require('./models/rssi_stay3.js');

var router_predict = require('./routes').predict.router(app, PREDICT);
var router_rssi_test = require('./routes').rssi_test.router(app, RSSI_TEST);
var router_current = require('./routes').current.router(app, CURRENT);
var router_rssi_real = require('./routes').rssi_real.router(app, RSSI_REAL);
var router_rssi_stay1 = require('./routes').rssi_stay1.router(app, RSSI_STAY1);
var router_rssi_stay2 = require('./routes').rssi_stay2.router(app, RSSI_STAY2);
var router_rssi_stay3 = require('./routes').rssi_stay2.router(app, RSSI_STAY3);





