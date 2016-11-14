/**
 *  Integration of image processing for automatic output module
 *
 *  @author Dominik Serve
 *  @date 2016-11-06
 */
var zmq = require('zmq');
var socket_address = CONFIG.AutomaticOutputModule;

var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(module, EventEmitter);


function module(){
  EventEmitter.call(this);
  this.client = undefined;
  this.active = false;
  this.numberOfAttempts = CONFIG.AutomaticOutputModuleAttempts;
  this.busy = false;
}

exports.newAutomaticOutput = new module();

module.prototype.log = function(message) {
  console.log('Automatic-Output-Module: '.cyan, message);
};

module.prototype.start = function(){
  var self = this;
  self.log('starting to connect');
  this.client = zmq.socket('req');

  this.client.on('connect', function (fd, ep) {
    self.log('zeroMQ connected to ' + ep);
    self.active = true;
    self.emit('active');
  });
  this.client.on('connect_retry', function (fd, ep) {
    if(self.active){
      self.log('zeroMQ reconnecting to ' + ep);
      self.emit('inactive');
      self.emit('disconnect');
      self.active = false;
    }
  });
  this.client.on('close', function (fd, ep) {
    if(self.active){
      self.log('zeroMQ connection with '+ep+' closed');
      self.emit('inactive');
      self.emit('disconnect');
      self.active = false;
    }
  });
  this.client.on('disconnect', function (fd, ep) {
    if(self.active){
      self.log('zeroMQ connection with '+ep+' disconnected');
      self.emit('inactive');
      self.emit('disconnect');
      self.active = false;
    }
  });
  this.client.on('message', function(reply){
    console.log("Received reply: [", reply.toString(), ']');
    self.emit('server_message', reply.toString());
  });
  this.client.monitor(1000,0);
  this.client.connect(socket_address);
  process.on('SIGINT', function() {
    self.client.close();
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
  this.client.send('execute');
  self.emit('message', 'Started... Waiting for response by Camera Module.');
  self.on('server_message', subscribed);
  self.on('abort', function(){
    self.removeListener('server_message', subscribed);
    self.removeAllListeners('abort');
  });

  function subscribed(message){
    console.log(message.toString());
    self.log('attempt:'+ attempt);

    if(message == true){
      var number = attempt +1;
      self.emit('message', 'Attempt ' + number + ' successful.');
      if(attempt == self.numberOfAttempts-1){
        self.emit('done');
        self.removeListener('server_message',subscribed);
        self.removeAllListeners('abort');
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
    self.client.send('execute');
  }

};

module.prototype.reset = function(){
  this.client.send('reset');
  this.removeAllListeners('done');
  this.emit('abort');
  this.busy = false;

};