/*
 * Models
 * 
 * Strange: Sometimes it works, sometimes not.
 * Somehow it has to do with IO connection and socket I think.
 */
exports.completeModule = function(req, res) {
  jadeData = {};

  var moduleInterface = require('./../models/simpleModuleInterface');
  // moduleInterface.setEndpointUrl('opc.tcp://localhost:4334/');
  // moduleInterface.setModule('Module1101');
  moduleInterface.setEndpointUrl('opc.tcp://localhost:4840/'); // MI5Simu
  moduleInterface.setModule('Module1101'); // MI5Simu

  moduleInterface.getCompleteModuleData(function(pModuleData) {
    if (pModuleData.module.error == 1) {
      jadeData.error = pModuleData.module.err;
    } else {
      jadeData.moduleData = pModuleData;
    }

    res.render('bootstrap/testModuleView', jadeData);
  });
};

/*
 * deprecated
 */
// console.log(_.uniqueId(myNodeId));
exports.index = function(req, res) {
  var opcuaInstance = require('./../models/simpleOpcua').server(
      'opc.tcp://localhost:4334/');
  jadeData = {};

  /*
   * ReadArray
   */
  opcuaInstance.on('readArrayFinished', function(data) {
    /*
     * Format the nodeValueArray to SkillContainer
     */
    var moduleData = {
      moduleData : {
        name : 'Halloho',
        skills : [ opcuaInstance
            .formatNodeValueArrayToSkillContainerArray(data) ]
      }
    };
    jadeData = _.extend(jadeData, moduleData);

    /*
     * When the array is read, subscribe to all the nodes, that belong to that
     * skill and register event emitters.
     */
    opcuaInstance.subscribe();
    data.forEach(function(entry) {
      var myNode = opcuaInstance.monitor('ns=4;s=' + entry.nodeId);
      myNode.on('changed', function(data) {
        console.log('changed:', entry.nodeId, data);
        IO.emit(entry.updateEvent, data);
      });

      console.log('added monitord item on:', entry.nodeId);
    });

    console.log('render');
    console.log(JSON.stringify(jadeData, null, 1));
    res.render('bootstrap/testModuleView', jadeData);
  });

  opcuaInstance.on('ready', function() {
    opcuaInstance.readArray(opcuaInstance.nodeArraySkillOutputSingle(
        'MI5.Module1101.Output.SkillOutput', 0));
  });

  opcuaInstance.initialize(); // when all callbare registered - initializeacks
};