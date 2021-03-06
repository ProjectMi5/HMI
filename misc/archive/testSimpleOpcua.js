/*
 * TestSuite
 */
GLOBAL.CONFIG = require('./../config.js');

// nodeServer4334 = require("./../misc/myTestSampleServer.js").newOpcuaServer(4321);

var async = require('async');
// var opc = require('./../models/simpleOpcua').server('opc.tcp://localhost:4334/');
var opc = require('./../models/simpleOpcua').server('opc.tcp://192.168.192.132:4840/');
GLOBAL.opcH = require('./../models/simpleOpcuaHelper');
var jadeH = require('./../models/simpleJadeHelper');

opc
    .initialize(function(err) {
      if (err) {
        console.log(err);
        return 0;
      }

      console.log('initialized');

      // opc.mi5Subscribe();
      // var mon = opc.mi5Monitor('MI5.Queue.Queue0.UserParameter.UserParameter0.Value');
      // mon.on("changed", function(data) {
      // console.log('CHANGED', data);
      // });

      async
          .series(
              [
//                  function(callback) {
//                    var mappingMi5DebugPendingFalse = require('./../models/simpleDataTypeMapping.js').Mi5DebugPendingFalse;
//
//                    var writethis = {
//                      Pending : true
//                    };
//
//                    opc.mi5WriteObject('MI5.Order[0].', writethis, mappingMi5DebugPendingFalse,
//                        function(err) {
//                          console.log('written in any case, no error available?');
//                          opc.disconnect();
//                        })
//                  },

//                  function(callback) {
//                    /*
//                     * Test single write object
//                     * 
//                     */  
//                    var Mi5ManualModule = require('./../models/simpleDataTypeMapping.js').Mi5ManualModule;
//                     opc.mi5WriteValue('Mi5.Module2402Manual.Execute', true, Mi5ManualModule, function(err) {
//                       console.log('OK - Maintenance Module - value written - no error feedback possible');
//                       callback();
//                     });
//                  },
                  function(callback) {
                    /*
                     * Test single write object
                     * 
                     */  
                    var Mi5ManualModule = require('./../models/simpleDataTypeMapping.js').Mi5ManualModule;
                     opc.mi5WriteObject('Mi5.Module2402Manual', {Execute: true}, Mi5ManualModule, function(err) {
                       console.log('OK - Maintenance Modasdf error feedback possible');
                       callback(err);
                     });
                  }

              // function(callback) {
              // testArray = [ 'MI5.Recipe[0].Name' ];
              // opc.mi5ReadArray(testArray, function(err, data) {
              // console.log(data);
              // callback(err);
              // });
              // },

              // function(callback) {
              // /*
              // * Test Recipe Read
              // */
              // var recipe = opc._structRecipeBase('MI5.Recipe[0].');
              // opc.mi5ReadArray(recipe, function(err, data) {
              // // console.log(data);
              //
              // var output = jadeH.convertMi5ReadArrayRecipeToJade(data);
              // // console.log(JSON.stringify(output, null, 1));
              // console.log(JSON.stringify(output, null, 1));
              // callback(err);
              // });
              // // console.log(structRecipeBase('MI5.Recipe[0].'));
              // },

              /*
               * write
               */
              // function(callback) {
              // /*
              // * Test Recipe Read
              // */
              // // opc.mi5WriteOrder(baseNode, order, userParameter, function(err) {
              // var dataObject = {
              // Name : '647372737',
              // TaskID : 6798,
              // Description : '6798',
              // RecipeID : 6789,
              // Locked : false,
              // Pending : true
              // };
              // var userParameters = [ {
              // Value : 666789
              // }, {
              // Value : 7312
              // }, {
              // Value : 9987
              // } ];
              // opc.mi5WriteOrder('MI5.Order[0].', dataObject, userParameters, function(err) {
              // console.log('write done');
              // callback(err);
              // });
              //
              // }
              /*
               * browse
               */
              // function(callback) {
              // opc.mi5Browse('ns=4;s=MI5', function(err, results) {
              // console.log(JSON.stringify(results, null, 1));
              //
              // /*
              // * look at references
              // */
              // results.references.forEach(function(item) {
              //
              // });
              //
              // callback(err);
              // });
              // }
              // function(callback) {
              // console.log('1');
              // testArray = [ 'MI5.Queue.Queue0.UserParameter.UserParameter0.Value',
              // 'MI5.Queue.Queue0.UserParameter.UserParameter1.Value' ];
              // opc.mi5ReadArray(testArray, function(err, data) {
              // console.log(err, data);
              // callback();
              // });
              //
              // },
              // function(callback) {
              // console.log('2');
              // testObject = {
              // UserParameter : [ {
              // Value : 30
              // }, {
              // Value : 10
              // } ]
              // };
              // opc.mi5WriteObject('MI5.Queue.Queue0', testObject, function(err) {
              // console.log(err);
              // callback();
              // });
              // },
              // function(callback) {
              // console.log('3');
              // testArray = [ 'MI5.Queue.Queue0.UserParameter.UserParameter0.Value',
              // 'MI5.Queue.Queue0.UserParameter.UserParameter1.Value' ];
              // opc.mi5ReadArray(testArray, function(err, data) {
              // console.log(err, data);
              // callback();
              // });
              // }
              ], function(err) {
                opc.disconnect(function() {
                });
                // setTimeout(function() {
                // console.log('----Terminated');
                // process.exit(0);
                // }, 1000);
                // });
              });

    });