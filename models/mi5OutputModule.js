/**
 * Maintenance Module in Class-Architecture
 * 
 * We need GLOBAL.CONFIG = require('./config.js');
 * 
 * @author Thomas Frei
 * @date 2014-11-020
 */
var jadeH = require('./simpleJadeHelper');
var opcH = require('./simpleOpcuaHelperModuleInterface');
var _123n = opcH._123n;
var assert = require('assert');

/**
 * InputModule Class
 * 
 * old name module, for not changing everything
 * 
 * @returns
 */
module = function() {
  var self = this;
  this.NumberOfSkillInputs = 2; // 15 max, but only 2 needed!
  this.NumberOfParameterInputs = 1; // 5 max

  this.NumberOfSkillOutputs = 2; // 15 max, but only 2 needed!
  this.NumberOfParameterOutputs = 1; // 5 max
  this.NumberOfStateValues = 2; // 10 max

  this.isInitialized = false;
  this.rawData = undefined;
  this.jadeData = {};

  this.socketRoom = 'output-module';
  this.ModuleId = 2601;
  this.SkillID = 1403;
  this.PositionOutput = 165;
  this.ModuleName = 'Output Module';

  this.opc = require('./../models/simpleOpcua').server(CONFIG.OPCUAOutputModule);
  console.log(preLog() + 'endpoint', CONFIG.OPCUAOutputModule);

  if(CONFIG.EnableAutomaticOutputModule){
    // test if automatic module is available
    try {
      var zmq = require('zmq');
      console.log(preLog(),'available.');
      self.jadeData.automaticModeAvailable = true;
    } catch (e){
      self.jadeData.automaticModeAvailable = false;
      if(e.code == 'MODULE_NOT_FOUND'){
        console.log(preLog(), 'Automatic mode is not available. Please install node_module "zmq" first.');
      }
      else
        console.log(preLog(),e);
    }
  } else {
    self.jadeData.automaticModeAvailable = false;
  }



  // and require it if available
  if(self.jadeData.automaticModeAvailable)
    this.automaticModule = require('./mi5OutputModuleAutomatic').newAutomaticOutput;

  this.Mi5ModuleInterface = require('./../models/simpleDataTypeMapping.js').Mi5ModuleInterface;
};
exports.newOutputModule = new module();

function preLog() {
  return 'Output-Module: '.cyan;
}

module.prototype.start = function(callback) {
  var self = mi5Output;

  self.initialize(function(err) {
    if (!err) {
      console.log('Output Module is connected to OPC UA server');
      self.getModuleData(function(err) {
        if (!err) {
          self.subscribe();
          self.makeItReady(callback);
        }
      });
    } else {
      console.log(preLog(), err);
      callback(err);
    }
  });

  if(self.jadeData.automaticModeAvailable){
    self.automaticModule.start();
    observeAutomaticModule();
    self.automaticModule.on('message', function(message){
      io.to(self.socketRoom).emit('automaticModuleExecutionMessage', message);
    });
  }

  /**
   *  observe automatic module
   *
   */
  function observeAutomaticModule(){
    self.automaticModule.on('active', function(){
      console.log(preLog(), 'Automatic Module active');
      self.jadeData.automaticModeAvailable = true;
      self.jadeData.automaticModeActive = true;
      self.jadeData.automaticModeConnected = true;
      io.to(self.socketRoom).emit('reloadPageOutput', 0);
    });
    self.automaticModule.once('active', function(){
      self.automaticModule.on('inactive', function(){
        self.jadeData.automaticModeAvailable = true;
        self.jadeData.automaticModeActive = false;
        io.to(self.socketRoom).emit('reloadPageOutput', 0);
      });
      self.automaticModule.on('disconnect', automaticModuleDisconnectedEvent);
    });
  }

  /**
   * function called when automatic module disconnect event occurs
   *
   */
  function automaticModuleDisconnectedEvent(){
    if(self.automaticModule.busy)
      io.to(self.socketRoom).emit('automaticModule', 'error while being busy');
    self.jadeData.automaticModeAvailable = true;
    self.jadeData.automaticModeActive = false;
    self.jadeData.automaticModeConnected = false;
    io.to(self.socketRoom).emit('reloadPageOutput', 0);
    //self.automaticModule.start();
  }

};



/**
 * initialize output module opcua connection
 * 
 * @param callback
 */
module.prototype.initialize = function(callback) {
  var self = this;

  assert(typeof callback === "function");

  self.opc.initialize(function(err) {
    if (err) {
      console.log(preLog(), err);
      callback(err);
      return 0;
    } else {
      self.isInitialized = true;

      // Create a subscription
      self.opc.mi5Subscribe();
      callback(err);
    }
  });
};

/**
 * get module Data
 * 
 * @param callback
 */
module.prototype.getModuleData = function(callbackMain) {
  var self = this;

  assert(self.isInitialized, 'opc is not initialized call self.initialize() *async* first');
  assert(typeof callbackMain === "function");

  async.series([ function(callback) {
    mi5Output.getInput(callback);
  }, function(callback) {
    mi5Output.getOutput(callback);
  }, ], function(err, results) {
    callbackMain();
  });
};

/**
 * mark initial state as ready
 * 
 * @param rawData
 * @param callback
 */
module.prototype.makeItReady = function(callbackMain) {
  var self = this;

  async.series([ function(callback) {
    self.setValue(self.jadeData.Dummy.nodeId, false, callback);
  }, function(callback) {
    self.setValue(self.jadeData.SkillOutput[0].ID.nodeId, self.SkillID, callback);
  }, function(callback) {
    self.setValue(self.jadeData.SkillOutput[0].Dummy.nodeId, false, callback);
  }, function(callback) {
    self.setValue(self.jadeData.SkillOutput[0].Ready.nodeId, true, callback);
  }, function(callback) { // Set Defaults now
    self.setValue(self.jadeData.SkillOutput[0].Busy.nodeId, false, callback);
  }, function(callback) {
    self.setValue(self.jadeData.SkillOutput[0].Done.nodeId, false, callback);
  }, function(callback) {
    self.setValue(self.jadeData.SkillInput[0].Execute.nodeId, false, callback);
  }, function(callback) {
    self.setValue(self.jadeData.PositionOutput.nodeId, self.PositionOutput, callback);
  }, function(callback) {
    self.setValue(self.jadeData.Name.nodeId, self.ModuleName, callback);
  }, function(callback) {
    console.log(preLog() + 'OK - Output Module is set to Ready-State');
    callbackMain();
  } ]);

};

// /////////////////////////////////////////////////////////////////
// OPC UA Subscriptions

/**
 * subscribe all module-specific variables
 * 
 * @param rawData
 * @param callback
 */
module.prototype.subscribe = function() {
  var self = this;

  assert(self.isInitialized, 'opc is not initialized call self.initialize() *async* first');

  var monitor = [ {
    nodeId : self.jadeData.SkillInput[0].Execute.nodeId,
    callback : self.onExecuteChange
  }, {
    nodeId : self.jadeData.SkillOutput[0].Busy.nodeId,
    callback : self.onBusyChange
  }, {
    nodeId : self.jadeData.SkillOutput[0].Done.nodeId,
    callback : self.onDoneChange
  }, {
    nodeId : self.jadeData.SkillOutput[0].Ready.nodeId,
    callback : self.onReadyChange
  } ];

  self.monitorItems(monitor);

  return 0;
};

module.prototype.onBusyChange = function(data) {
  var self = mi5Output; // since it is called before getModuleData

  if (data.value.value === true) {
    io.to(self.socketRoom).emit(self.jadeData.SkillOutput[0].Busy.updateEvent, true);
  }
  console.log(preLog() + 'onBusyChange', data.value.value);
};
module.prototype.onDoneChange = function(data) {
  var self = mi5Output; // since it is called before getModuleData

  if (data.value.value === true) {
    io.to(self.socketRoom).emit(self.jadeData.SkillOutput[0].Done.updateEvent, true);
  }
  console.log(preLog() + 'onDoneChange', data.value.value);
};
module.prototype.onExecuteChange = function(data) {
  var self = mi5Output; // since it is called before getModuleData

  if (data.value.value === true) {
    self.jadeData.SkillInput[0].Execute.value = true;
    io.to(self.socketRoom).emit(self.jadeData.SkillInput[0].Execute.updateEvent, true);
    io.to(self.socketRoom).emit('reloadPageOutput', 0);
    if(self.jadeData.automaticModeActive){
      self.automaticModule.execute();
      _.bindAll(self, 'socketUserIsBusy', 'socketUserIsDone');
      self.automaticModule.once('done', self.socketUserIsDone);
      self.socketUserIsBusy();
    }
    // Navbar
    io.emit('outputRequired', true);
  }
  if (data.value.value === false) {
    // task fully finished
    self.setValue(self.jadeData.SkillOutput[0].Done.nodeId, false, function() {
    });
    self.setValue(self.jadeData.SkillOutput[0].Ready.nodeId, true, function() {
    });
    io.emit('outputRequired', false);
    io.to(self.socketRoom).emit('reloadPageOutput', 0);
  }
  console.log(preLog() + 'onExecuteChange', data.value.value);
};
module.prototype.onReadyChange = function(data) {
  if (data.value.value === true) {
    console.log(preLog() + 'onReadyChange', data.value.value);
  }
};

// /////////////////////////////////////////////////////////////////
// Soket

module.prototype.ioRegister = function(socket) {
  var self = mi5Output; // this would be socket.io io.on('connection')

  _.bindAll(self, 'socketUserIsBusy', 'socketUserIsDone'); // reset scope

  assert(typeof socket !== 'undefined');

  socket.on(self.jadeData.SkillOutput[0].Busy.submitEvent, self.socketUserIsBusy);
  socket.on(self.jadeData.SkillOutput[0].Done.submitEvent, self.socketUserIsDone);
  socket.on('socketUserChangeMode', socketUserChangeMode);

  function socketUserChangeMode(){
    console.log(preLog(), 'User wants to change the mode.');
    if(self.jadeData.automaticModeActive){
      if(self.automaticModule.busy){
        self.automaticModule.reset();
      }
    } else {
      if(self.jadeData.SkillInput[0].Execute.value){
        self.automaticModule.execute();
        _.bindAll(self, 'socketUserIsBusy', 'socketUserIsDone');
        self.automaticModule.once('done', self.socketUserIsDone);
        self.socketUserIsBusy();
      }
    }
    self.jadeData.automaticModeActive = !self.jadeData.automaticModeActive;
    io.to(self.socketRoom).emit('reloadPageOutput', 1);
  }

  console.log(preLog() + 'OK - Output Module - event listeners registered');
};

module.prototype.socketUserIsBusy = function() {
  var self = this;
  console.log('busy');
  if(self.jadeData.SkillInput[0].Execute.value == true){
    console.log(preLog() + 'OK - User is busy');
    self.setValue(self.jadeData.SkillOutput[0].Busy.nodeId, true, function() {
    });
    self.setValue(self.jadeData.SkillOutput[0].Ready.nodeId, false, function() {
    });
  } else {
    console.log(preLog() + 'someone pressed busy even though there is no execute!');
  }

};

module.prototype.socketUserIsDone = function() {
  var self = this;

  if(self.jadeData.SkillInput[0].Execute.value == true) {
    self.setValue(self.jadeData.SkillOutput[0].Done.nodeId, true, function (err) {
      console.log(preLog() + 'OK - User is done');
    });
    if(self.automaticModule.busy){
      self.automaticModule.reset();
    }
    self.setValue(self.jadeData.SkillOutput[0].Busy.nodeId, false, function (err) {
      console.log(preLog() + 'OK - waiting for PT to set execute = false');
    });
  } else {
    console.log(preLog() + 'someone pressed done even though there is no execute!');
  }
};

// /////////////////////////////////////////////////////////////////
// Backend

/**
 * monitor a list of items and assign a callback event
 * 
 * @param itemArray
 *          <array> [{nodeId: '', callback: cbFunction}]
 * @returns <boolean>
 */
module.prototype.monitorItems = function(itemArray) {
  var self = this;

  assert(_.isArray(itemArray));

  itemArray.forEach(function(item) {
    mI = self.opc.mi5Monitor(item.nodeId);
    mI.on('changed', item.callback);
  });
  return true;
};

/**
 * set a key:value object based on a basenode
 * 
 * @async
 * @param baseNode
 *          <string> 'MI5.Module2402Manual'
 * @param dataObject
 *          <object> {Execute: true}
 * @param callback
 *          <function>
 */
module.prototype.setObject = function(baseNode, dataObject, callback) {
  var self = this;

  assert(typeof baseNode === "string");
  assert(_.isObject(dataObject));

  self.opc.mi5WriteObject(baseNode, dataObject, self.Mi5ModuleInterface, callback);
};

/**
 * set a nodeid value pair (using jadeDate this is useful)
 * 
 * @uses this.setObject()
 * @param nodeId
 *          <string> 'MI5.Module2402Manual.Execute'
 * @param value
 *          <mixed>
 * @param callback
 *          <function>
 */
module.prototype.setValue = function(nodeId, value, callback) {
  var self = this;

  assert(typeof nodeId === "string");
  assert(typeof callback === 'function');

  var baseNode = self.cutLastElement(nodeId);
  var lastElement = opcH.getLastElement(nodeId);

  var dataObject = {};
  dataObject[lastElement] = value;

  self.setObject(baseNode, dataObject, callback);
};

// ///////////////////////////////////////////////////////////////////////////////////////////
// Module Interface Stuff

/**
 * cuts las telement in a node id, to generate a basenode for insertion
 * 
 * @param nodeId
 *          <string> MI5.Module2501.Output.SkillOutput.SkillOutput0.Busy
 * @return <string> MI5.Module2501.Output.SkillOutput.SkillOutput0.
 */
module.prototype.cutLastElement = function(nodeId) {
  var exp = /\w*[0-9]?/g
  var result = nodeId.match(exp);
  result = _.compact(result); // [ 'MI5', 'Module2501', 'SkillInput', 'SkillInput0',...]
  result.pop();
  result = result.join('.') + '.';
  return result;
};

/**
 * Get Inputs
 * 
 * @async
 * @param inputIdArray
 * @function callback(err, tasksArray)
 */
module.prototype.getInput = function(callback) {
  var self = this;

  assert(self.isInitialized, 'opc is not initialized call self.initialize() *async* first');
  assert(typeof callback === 'function');

  var baseNodeTask = self.structInput('MI5.Module' + self.ModuleId + '.Input.');

  self.opc.mi5ReadArray(baseNodeTask, function(err, data) {
    // console.log(err, data);
    // Convert opc.Mi5 object to jadeData
    var mi5Object = opcH.mapMi5ArrayToObject(data, self.structInputObjectBlank());

    _.extend(self.jadeData, mi5Object);
    callback(err, mi5Object);
  }); // end opc.mi5ReadArray

};

/**
 * Get Outputs
 * 
 * @async
 * @param callback
 *          <function>
 * @function callback(err, tasksArray)
 */
module.prototype.getOutput = function(callback) {
  var self = this;

  assert(self.isInitialized, 'opc is not initialized call self.initialize() *async* first');
  assert(typeof callback === 'function');

  // Generate Array to read
  var baseNodeStruct = self.structOutput('MI5.Module' + self.ModuleId + '.Output.');
  // console.log(baseNodeStruct);

  self.opc.mi5ReadArray(baseNodeStruct, function(err, data) {
    // console.log(err, data);
    // Convert opc.Mi5 object to jadeData
    var mi5Object = opcH.mapMi5ArrayToObject(data, self.structOutputObjectBlank());

    _.extend(self.jadeData, mi5Object);
    callback(err, mi5Object);
  }); // end opc.mi5ReadArray
};

// ///////////////////////////////////////////////////////////////////////////////////////////
// Input
/**
 * Get Blank InputStruct
 * 
 * @returns <object>
 */
module.prototype.structInputObjectBlank = function() {
  var self = this;

  // Base
  var inputDummy = {
    ConnectionTestInput : '',
    EmergencyStop : '',
    Mode : '',
    PositionInput : '',
    SkillInput : [],
    Watchbit : ''
  };
  // Skills
  _123n(0, self.NumberOfSkillInputs).forEach(function(i) {
    var skillInputDummy = {
      Execute : '',
      ParameterInput : []
    };

    // UserParameters
    _123n(0, self.NumberOfParameterInputs).forEach(function(j) {
      var parameterDummy = {
        Value : '',
        StringValue : ''
      };
      skillInputDummy.ParameterInput.push(parameterDummy);
    }); // end forEach UserParameters

    inputDummy.SkillInput.push(skillInputDummy);
  }); // end forEach Skills

  return inputDummy;
}

/**
 * Adds SkillInput to a basenode (no-array-architecture)
 * 
 * @param baseNode
 *          string
 * @return array
 */
module.prototype.structInput = function(baseNode) {
  var self = this;

  var nodes = [ 'ConnectionTestInput', 'EmergencyStop', 'Mode', 'PositionInput', 'Watchbit' ];
  // Add all 50 Skills
  for (var i = 0; i <= self.NumberOfSkillInputs; i++) {
    var temp = self.structSkillInput('SkillInput.SkillInput' + i + '.');
    temp.forEach(function(item) {
      nodes.push(item);
    });
  }
  // Prepend baseNode
  nodes = _.map(nodes, function(item) {
    return baseNode + item;
  });

  return nodes;
};

/**
 * Adds ParameterInput to a basenode (no-array-architecture)
 * 
 * @param baseNode
 *          <string>
 * @return array
 */
module.prototype.structSkillInput = function(baseNode) {
  var self = this;

  var nodes = [ 'Execute' ];
  // Add all 5 Parameters
  for (var i = 0; i <= self.NumberOfParameterInputs; i++) {
    var temp = self.structParameterInput('ParameterInput.ParameterInput' + i + '.');
    temp.forEach(function(item) {
      nodes.push(item);
    });
  }
  // Prepend baseNode
  nodes = _.map(nodes, function(item) {
    return baseNode + item;
  });
  return nodes;
};

/**
 * Adds nodes to UserParameter[x].YYYYYYYYYYY
 * 
 * @param baseNode
 *          <string>
 * @return <array>
 */
module.prototype.structParameterInput = function(baseNode) {
  var self = this;

  var nodes = [ 'StringValue', 'Value' ];
  // Prepend baseNode
  nodes = _.map(nodes, function(item) {
    return baseNode + item;
  });
  return nodes;
};

// ///////////////////////////////////////////////////////////////////////////////////////////
// Output
/**
 * Get Blank InputStruct
 * 
 * @returns <object>
 */
module.prototype.structOutputObjectBlank = function() {
  var self = this;

  // Base
  var outputDummy = {
    Connected : '',
    ConnectionTestInput : '',
    CurrentTaskDescription : '',
    Dummy : '',
    Error : '',
    ErrorDescription : '',
    ErrorID : '',
    ID : '',
    IP : '',
    Idle : '',
    Name : '',
    PosisitionOutput : '',
    PositionSensor : '',
    SkillOutput : [],
    StateValue : [],
  };
  // Skills // Dummyobject needs to be insed the loop - pass by reference issue
  // imho
  _123n(0, self.NumberOfSkillOutputs).forEach(function(i) {
    var skillOutputDummy = {
      Activated : '',
      Busy : '',
      Done : '',
      Dummy : '',
      Error : '',
      ID : '',
      Name : '',
      ParameterOutput : [],
      Ready : ''
    };

    _123n(0, self.NumberOfParameterOutputs).forEach(function(j) {
      // UserParameters
      var parameterOutputDummy = {
        Default : '',
        Dummy : '',
        ID : '',
        MaxValue : '',
        MinValue : '',
        Name : '',
        Required : '',
        Unit : ''
      };
      skillOutputDummy.ParameterOutput.push(parameterOutputDummy);
    }); // end forEach UserParameters

    outputDummy.SkillOutput.push(skillOutputDummy);
  }); // end forEach Skills

  _123n(0, self.NumberOfStateValues).forEach(function(k) {
    var stateValueDummy = {
      Description : '',
      Dummy : '',
      Name : '',
      Unit : '',
      Value : ''
    };
    outputDummy.StateValue.push(stateValueDummy);
  });
  return outputDummy;
};

/**
 * Adds SkillOutput to a basenode (no-array-architecture)
 * 
 * @param baseNode
 *          string
 * @return array
 */
module.prototype.structOutput = function(baseNode) {
  var self = this;

  var nodes = [ 'Connected', 'ConnectionTestInput', 'CurrentTaskDescription', 'Dummy', 'Error',
      'ErrorDescription', 'ErrorID', 'ID', 'IP', 'Idle', 'Name', 'PositionOutput', 'PositionSensor' ];
  // Add SkillOutputs
  for (var i = 0; i <= self.NumberOfSkillOutputs; i++) {
    var temp = self.structSkillOutput('SkillOutput.SkillOutput' + i + '.');
    temp.forEach(function(item) {
      nodes.push(item);
    });
  }
  // Add StateValues
  for (var g = 0; g <= self.NumberOfStateValues; g++) {
    var temp2 = self.structStateValue('StateValue.StateValue' + g + '.');
    temp2.forEach(function(item) {
      nodes.push(item);
    });
  }

  // Prepend baseNode
  nodes = _.map(nodes, function(item) {
    return baseNode + item;
  });

  return nodes;
};

/**
 * Adds SkillOutput to a basenode (no-array-architecture)
 * 
 * @param baseNode
 *          <string>
 * @return array
 */
module.prototype.structSkillOutput = function(baseNode) {
  var self = this;

  var nodes = [ 'Activated', 'Busy', 'Done', 'Dummy', 'Error', 'ID', 'Name', 'Ready' ];
  // Add all 5 Parameters
  for (var i = 0; i <= self.NumberOfParameterInputs; i++) {
    var temp = self.structParameterOutput('ParameterOutput.ParameterOutput' + i + '.');
    temp.forEach(function(item) {
      nodes.push(item);
    });
  }
  // Prepend baseNode
  nodes = _.map(nodes, function(item) {
    return baseNode + item;
  });
  return nodes;
};

/**
 * Adds nodes to ParameterOutput.ParameterOutputX.YYY
 * 
 * @param baseNode
 *          <string>
 * @return <array>
 */
module.prototype.structParameterOutput = function(baseNode) {
  var self = this;

  var nodes = [ 'Default', 'Dummy', 'ID', 'MaxValue', 'MinValue', 'Name', 'Required', 'Unit' ];
  // Prepend baseNode
  nodes = _.map(nodes, function(item) {
    return baseNode + item;
  });
  return nodes;
};

/**
 * Adds nodes to Output.StateValue[X].YYYY
 * 
 * @param baseNode
 *          <string>
 * @return <array>
 */
module.prototype.structStateValue = function(baseNode) {
  var self = this;

  var nodes = [ 'Description', 'Dummy', 'Name', 'Unit', 'Value' ];
  // Prepend baseNode
  nodes = _.map(nodes, function(item) {
    return baseNode + item;
  });
  return nodes;
};