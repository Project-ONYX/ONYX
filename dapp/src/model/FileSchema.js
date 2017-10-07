'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FileSchema = new Schema({
	id: String,
	file: { data: Buffer, contentType: String }
});

module.exports = mongoose.model("FileSchema", FileSchema);