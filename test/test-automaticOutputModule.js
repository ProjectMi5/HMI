/**
 * Created by Dominik on 06.11.2016.
 */
/********************************* Testing Framework **************************************/
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var assert = require('assert');
/********************************* Test *****************************************/
describe('MQTT - Test', function() {
  var automaticOutput = require('../models/mi5OutputModuleAutomatic').newAutomaticOutput;

  before(function(){
    automaticOutput.start();
    });

  it('#isActive', function(){
    automaticOutput.on('active',function(){
      setTimeout(function(){
        assert.equal(automaticOutput.active,false,'Hello');
      },100);
    });

  })

});