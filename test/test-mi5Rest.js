/**
 * Created by Thomas on 09.09.2015.
 */
/********************************* Testing Framework **************************************/
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);
// var should = chai.should();

/********************************* App Mockup   ***************************************/
// Configuration
GLOBAL.CONFIG = require('./../config.js').config;
console.log(CONFIG.RESTHostAuth);

GLOBAL.mi5Logger = require('./../models/mi5Logger').logger;
mi5Logger.start();

var mi5rest = require('./../models/mi5rest').instance;

describe.skip('Test mi5rest API', function(){
  it('#_checkServer()', function(){
  	return mi5rest._checkServer();
  });

  it('#manageRecipe()', function(){
    var recipe = {
      userparameters:
        [ { Default: 200,
            Description: 'Gives the total fluid amount in the glass',
            Dummy: false,
            MaxValue: 200,
            MinValue: 10,
            Name: 'Total Liquid Amount',
            Step: 0,
            Unit: 'ml' },
          { Default: 50,
            Description: 'Maracuja Juice',
            Dummy: false,
            MaxValue: 100,
            MinValue: 1,
            Name: 'Maracuja Juice',
            Step: 0,
            Unit: 'ml' },
          { Default: 35,
            Description: 'Orange Juice',
            Dummy: false,
            MaxValue: 100,
            MinValue: 1,
            Name: 'Orange Juice',
            Step: 0,
            Unit: 'ml' },
          { Default: 15,
            Description: 'Grenadine Syrup',
            Dummy: false,
            MaxValue: 50,
            MinValue: 1,
            Name: 'Grenadine Syrup',
            Step: 0,
            Unit: 'ml' } ],
      Description: 'Sweet cocktail combining the sourness of maracuja and orange juice with the sweetness of grenadine syrup',
      Dummy: false,
      Name: 'Free Passion',
      RecipeID: 10051 };

    return mi5rest.manageRecipe(recipe);
  })
});