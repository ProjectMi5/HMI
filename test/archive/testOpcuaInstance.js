//var nodeId = 'ns=4;s=MI5.Module1101.Output.ConnectionTestOutput';

GLOBAL.CONFIG = require('./../config.js');
var opcuaModule1 = require('./../models/opcuaInstance').server('opc.tcp://localhost:4334/');

// opcuaModule1.on('readFinished', function(data){
// console.log('Read-Module1: ConnectionTestOutput:', data.value);
// });

// opcuaModule1.on('monitoredItemChanged', function(data){console.log(data); });

/*
 * Arraytest
 */
// opcuaModule1.on('readArrayFinished', function(data) {
// console.log(data);
// });
opcuaModule1.on('ready', function() {
  //  
  // console.log(opcuaModule1);
  //  
  // setInterval( function(){
  // opcuaModule1.read(nodeId);
  // }, 10*1000);
  //  
  //
  // opcuaModule1.subscribe();
  // opcuaModule1.monitor(nodeId);
  // opcuaModule1.monitor('ns=4;s=MI5.Module1101.Output.SkillOutput.SkillOutput0.Busy');
  //  
  /*
   * Arraytest
   */
  // var NodesToRead = ['ns=4;s=MI5.Module1101.Output.SkillOutput.SkillOutput0.Busy',
  // 'ns=4;s=MI5.Module1101.Output.SkillOutput.SkillOutput0.Ready'];
  // opcuaModule1.readArray(NodesToRead);
  // Test write Object
  var data = {
    Description : 'Halloho"',
    Name : 'Meine Bestellung',
    RecipeID : '12',
    TaskID : '1',
    UserParameter : [ 0, 10, 15 ]
  };
  opcuaModule1.writeObjectCb('MI5.Queue.Queue0', data, function(err, status) {
    // console.log(err);
    if (!err) {
      console.log('success');
    }
  });
});

opcuaModule1.initialize();