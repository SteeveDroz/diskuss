"use strict";
var Channel = function(name) {
    this.name = name;
    this.description = name;
    this.keep = false;
}

Channel.create = function(json) {
  this.name = json.name;
  this.description = json.description;
  this.keep = json.keep;
}

exports.Channel = Channel;