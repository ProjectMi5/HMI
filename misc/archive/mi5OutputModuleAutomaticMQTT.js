/**
 *  Integration of image processing for automatic output module
 *  First draft with MQTT
 *
 *  @author Dominik Serve
 *  @date 2016-11-07
 */
var mqtt = require('mqtt');
var mqttAddress = 'tcp://192.168.0.20';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(module, EventEmitter);


function module(){
  EventEmitter.call(this);
  this.client = undefined;
  this.active = false;
  this.numberOfAttempts = 3;
  this.busy = false;
}

exports.newAutomaticOutput = new module();

module.prototype.log = function(message) {
  console.log('Automatic-Output-Module: '.cyan, message);
};

module.prototype.start = function(){
  var self = this;
  self.log('starting to connect')
  this.client = mqtt.connect(mqttAddress);
  this.client.on('connect', function () {
    self.log('MQTT Connected');
    self.client.publish('presence', 'Hello mqtt');
    self.active = true;
    self.emit('active');
  });
  this.client.on('reconnecting', function () {
    self.log('MQTT Reconnecting');
    self.emit('inactive');
    self.active = false;
  });
  this.client.on('close', function () {
    self.log('MQTT Connection closed');
    self.emit('inactive');
    self.active = false;
  });
};

module.prototype.stop = function(){
  this.client.close();
  this.emit('close');
};

module.prototype.execute = function(){
  this.log('execute');
  var self = this;
  if(this.busy)
    return self.log('Already running.');

  this.busy = true;
  self.emit('busy');
  var attempt = 0;
  var moduleTopic = 'result';
  this.client.subscribe(moduleTopic);
  this.client.publish('execute', '1');
  this.client.on('message', subscribed);

  function subscribed(topic,message){
    console.log(topic,message.toString());
    self.log('attempt:'+ attempt);
    if(topic === moduleTopic){
      if(message == true){
        var number = attempt +1;
        self.emit('message', 'Attempt ' + number + ' successful.');
        if(attempt == self.numberOfAttempts-1){
          self.emit('done');
          self.client.unsubscribe(moduleTopic);
          self.client.removeListener('message', subscribed);
          self.busy = false;
          return;
        } else {
          // attemt < self.numberOfAttempts
          attempt ++;
        }
      } else {
        // message was false
        var number = attempt +1;
        self.emit('message', 'Attempt ' + number + ' unsuccessful. Restarting.');
        attempt = 0;
      }
      self.client.publish('execute','1');
    }
  }
};