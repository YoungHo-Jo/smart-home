/***********************
	[TODO] 
		Implement UPDATE, DELETE

***********************/

_ = require("underscore");
var predict = require("./predict.js");
var rssi_test = require("./rssi_test.js");
var rssi_real = require("./rssi_real.js");
var rssi_stay1 = require("./rssi_stay1.js");
var rssi_stay2 = require("./rssi_stay2.js");
var rssi_stay3 = require("./rssi_stay3.js");
var current = require("./current.js");

module.exports = {
	predict: predict,
	current : current,
	rssi_test : rssi_test,
	rssi_real : rssi_real,
	rssi_stay1 : rssi_stay1,
	rssi_stay2 : rssi_stay2,
	rssi_stay3 : rssi_stay3
}