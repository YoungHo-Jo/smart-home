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

var rssiStay2Schema = new Schema(
  {
    title: String,
    mobius_info : {
      type: String
    }
  },
  { 
    strict: false 
  }
);

module.exports = mongoose.model('rssi_stay2', rssiStay2Schema);
