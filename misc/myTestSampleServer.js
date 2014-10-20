/**
 * Sample Server following the tutorial:
 * 
 * http://node-opcua.github.io/create_a_server.html
 * @author Thomas Frei
 */
var opcua = require("node-opcua");

var serverVars = new Array();
var localVars = new Array();
    
var server = new opcua.OPCUAServer({
  port: 4334 // the port of the listening socket of the server
});

// optional
server.buildInfo.productName = "MySampleServer1";
server.buildInfo.buildNumber = "7658";
server.buildInfo.buildDate = new Date(2014,5,2);

function construct_my_address_space(server) {

  // declare some folders
  server.engine.createFolder("RootFolder",{ browseName: "MyDevice"});

  // add variables in folder
  createOpcuaVariable( 'GVL.OPCModule[1].Output.SkillOutput.SkillOutput[1].Ready', 'Ready', 'Double', 1 );
  createOpcuaVariable( 'GVL.OPCModule[1].Input.SkillInput.Skillinput[1].ParameterInput.Value', 'Input', 'Double', 0 );
  createOpcuaVariable( 'GVL.OPCModule[1].Input.SkillInput.Skillinput[1].Execute', 'Execute', 'Double', 0 );
  createOpcuaVariable( 'GVL.OPCModule[1].Output.SkillOutput.SkillOutput[1].Busy', 'Busy', 'Double', 0 );
  createOpcuaVariable( 'GVL.OPCModule[1].Output.SkillOutput.SkillOutput[1].Done', 'Done', 'Double', 0 );
  
}

function post_initialize() {
  console.log("initialized");
  
  construct_my_address_space(server);
  
  server.start(function() {
    console.log("Server is now listening ... ( press CTRL+C to stop)");
    console.log("port ", server.endpoints[0].port);
    
    var endpointUrl = server.endpoints[0].endpointDescription().endpointUrl;
    console.log(" the primary server endpoint url is ", endpointUrl );
  
  });
}

server.initialize(post_initialize);


/**
 * Generate 15 digit random string
 * used for 'variable variable names'
 * @returns {String}
 */
function makeServerVariable()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 15; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

/**
 * Create an OPC UA Variable
 * @param DesiredNodeId
 * @param Description
 * @param VariableType
 * @param DefaultValue
 * @returns {String} name of server-object that stores the value (server.NewObject)
 */
function createOpcuaVariable(DesiredNodeId, Description, VariableType, DefaultValue) {
  /*
   * Generate Default values for the input variables
   */
  DesiredNodeId = typeof DesiredNodeId !== 'undefined' ? ( 'ns=4;s=' + DesiredNodeId ) : '';
  VariableType = typeof VariableType !== 'undefined' ? VariableType : 'String';
  
  var currentElement = localVars.length;
  localVars[currentElement] = DefaultValue;
  
  randomString  = makeServerVariable();
  server[randomString] = server.engine.addVariableInFolder("MyDevice",{
    nodeId: DesiredNodeId, // some opaque NodeId in namespace 4 (optional) "ns=4s=GVL.OPCModule.Output.Skill;
    browseName: Description,
    dataType: VariableType,    
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType[VariableType], value: localVars[currentElement] });
        },
        set: function (variant) {
          if ( VariableType == 'Double') {
            localVars[currentElement] = parseFloat(variant.value);
          } else {
            localVars[currentElement] = variant.value;
          }
          return opcua.StatusCodes.Good;
        }
    }
  });
  console.log('Variable ', Description, ' added');
  return randomString;
}

function doubleOpcua(DefaultValue, Description) {
  var currentElement = localVars.length;
  localVars[currentElement] = DefaultValue;
  var newServerVar = server.engine.addVariableInFolder("MyDevice",{
    //nodeId: "ns=4;b=1020FFAA", // some opaque NodeId in namespace 4 (optional)
    browseName: Description,
    dataType: "Double",    
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: localVars[currentElement] });
        },
        set: function (variant) {
          localVars[currentElement] = parseFloat(variant.value);
          return opcua.StatusCodes.Good;
        }
    }
  });
  console.log('Variable ', Description, ' added');
  return newServerVar;
};
function stringOpcua(DefaultValue, Description, desiredNodeId) {
  desiredNodeId = typeof desiredNodeId !== 'undefined' ? ( 'ns=4;s=' + desiredNodeId ) : '';
  randomString  = makeServerVariable();
  
  var currentElement = localVars.length;
  localVars[currentElement] = DefaultValue;
  server[randomString] = server.engine.addVariableInFolder("MyDevice",{
    nodeId: desiredNodeId, // some opaque NodeId in namespace 4 (optional) "ns=4s=GVL.OPCModule.Output.Skill;
    browseName: Description,
    dataType: "String",    
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.String, value: localVars[currentElement] });
        },
        set: function (variant) {
          localVars[currentElement] = variant.value;
          return opcua.StatusCodes.Good;
        }
    }
  });
  console.log('Variable ', Description, ' added');
  return randomString;
};

function doubleOpcuaVariable(variable, Description) {
  var newServerNodeVariable = server.engine.addVariableInFolder("MyDevice",{
    //nodeId: "ns=4;b=1020FFAA", // some opaque NodeId in namespace 4 (optional)
    browseName: Description,
    dataType: "Double",    
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable });
        },
        set: function (variant) {
          variable = parseFloat(variant.value);
          return opcua.StatusCodes.Good;
        }
    }
  });
  console.log('Variable ', Description, ' added');
  return newServerNodeVariable;
};
function stringOpcuaVariable(variable, Description) {
  var newServerNodeVariable = server.engine.addVariableInFolder("MyDevice",{
    //nodeId: "ns=4;b=1020FFAA", // some opaque NodeId in namespace 4 (optional)
    browseName: Description,
    dataType: "String",    
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.String, value: variable });
        },
        set: function (variant) {
          variable = variant.value; // comes in as a string
          return opcua.StatusCodes.Good;
        }
    }
  });
  console.log('Variable ', Description, ' added');
  return newServerNodeVariable;
};