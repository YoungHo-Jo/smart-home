/***********************
  **schema Type**
  String
  Number
  Date
  Buffer
  Boolean
  Mixed
  Objectid
  Array
***********************/
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var rssitestSchema = new Schema(
  {
    title: String,
    time: { type: Date, default: Date.now  },
    rssi_data : {type : Array},
    current_data : {type : Array}
  },
  { 
    strict: false 
  }
);


module.exports = mongoose.model('rssi_test', rssitestSchema);
