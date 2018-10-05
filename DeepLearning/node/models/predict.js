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

var predictSchema = new Schema(
  {
    title: String,
    plug1 : {type : String},
    plug2 : {type : String},
    plug3 : {type : String},
    plug4 : {type : String},
    timestamp: { type: Date, default: Date.now  }
  },
  { 
    strict: false 
  }
);

module.exports = mongoose.model('predict', predictSchema);
