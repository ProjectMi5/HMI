/**
 * Created by Dominik on 06.11.2016.
 */

var automaticOutput = require('../models/mi5OutputModuleAutomatic').newAutomaticOutput;
automaticOutput.start();
automaticOutput.once('active',function(){
  console.log('active');
  automaticOutput.execute();
});
automaticOutput.on('message', function(message){
  console.log(message);
});
automaticOutput.on('done', function(){
  console.log('done');
});

