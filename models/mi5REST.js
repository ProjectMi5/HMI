var Q = require('q');
var _ = require('underscore');
var request = require('request');

/**
 *
 */
mi5rest = function() {
  // check if host is online
  var self = this;
  
  try {
    self._checkServer()
	  .spread(function(res, body){
	    console.log(body);
		  console.log('REST API started');
		})
	  .catch(console.log);
  } catch(err){
    console.log('catch',err);
  }

};

// This is needed, since mi5rest constructor is synchronous, its promised-
// based API not. otherwise: ZALGO!

var instance = new mi5rest();
exports.instance = instance;

mi5rest.prototype.saveOrder = function(taskId, recipeId, userParameters){
  var self = instance;

  var order = {taskId: taskId,
    recipeId: recipeId,
    parameters: userParameters};

  mi5Logger.info('new order saved to database:'+JSON.stringify(order,' '));
  return NewOrder.saveQ();
};

mi5rest.prototype.manageRecipe = function(recipe){
  var self = instance;
    
  var options = {
    url: CONFIG.RESTHost+'/manageRecipe',
    rejectUnauthorized: false,
    form: {
      recipe: JSON.stringify(recipe)
    },
    auth: {
      user: CONFIG.RESTUser,
      password: CONFIG.RESTPassword
    }
  };
  
  return Q.promise(function(resolve, reject){
    request.post(options, function(err, res){
      if(!err){
        // check res
        if(res.statusCode != 200) {
          reject(new Error('statusCode is not ok \n res:' + JSON.stringify(res, '\n')));
        } else {
          // all fine
          resolve(res);
        }
      } else {
        reject(new Error(err));
      }
    });
  });
};

mi5rest.prototype.setBarcodeToOrderId = function(orderid, barcode){
  var self = instance;

  var options = {
    url: CONFIG.RESTHost+'/setBarcode',
    rejectUnauthorized: false,
    form: {
      id: orderid,
      barcode: barcode
    },
    auth: {
      user: CONFIG.RESTUser,
      password: CONFIG.RESTPassword
    }
  };

  return Q.promise(function(resolve, reject){
    request.post(options, function(err, res){
      if(!err){
        // check res
        if(res.statusCode != 200) {
          reject(new Error('statusCode is not ok \n res:' + JSON.stringify(res, '\n')));
        } else {
          // all fine
          resolve(res);
        }
      } else {
        reject(new Error(err));
      }
    });
  });
};

mi5rest.prototype.updateOrderStatus = function(orderid, status){
  var self = instance;

  var options = {
    url: CONFIG.RESTHost+'/updateOrderStatus',
    rejectUnauthorized: false,
    form: {
      id: orderid,
      status: status
    },
    auth: {
      user: CONFIG.RESTUser,
      password: CONFIG.RESTPassword
    }
  };

  return Q.promise(function(resolve, reject){
    request.post(options, function(err, res){
      if(!err){
        // check res
        if(res.statusCode != 200) {
          reject(new Error('statusCode is not ok \n res:' + JSON.stringify(res, '\n')));
        } else {
          // all fine
          resolve(res.body);
        }
      } else {
        reject(new Error(err));
      }
    });
  });
};

mi5rest.prototype.placeOrder = function(recipeId, parameters, marketPlaceId){
  var self = instance;
  var order = {
    recipeId: recipeId,
    parameters: parameters,
    marketPlaceId: marketPlaceId
  };

  var options = {
    url: CONFIG.RESTHost+'/placeOrder',
    rejectUnauthorized: false,
    form: {
      order: JSON.stringify(order)
    },
    auth: {
      user: CONFIG.RESTUser,
      password: CONFIG.RESTPassword
    }
  };

  return Q.promise(function(resolve, reject){
    request.post(options, function(err, res){
      if(!err){
        // check res
        if(res.statusCode != 200) {
          reject(new Error('statusCode is not ok \n res:' + JSON.stringify(res, '\n')));
        } else {
          // all fine
          resolve(res.body);
        }
      } else {
        reject(new Error(err));
      }
    });
  });
};

mi5rest.prototype._checkServer = function(){
  var self = this;

  return Q.Promise(function(resolve, reject){
    // TODO: import mi5.itq.de certificate
    // http://stackoverflow.com/questions/20082893/unable-to-verify-leaf-signature
    var options = {
      url: CONFIG.RESTHost,
      rejectUnauthorized: false,
      auth: {
        user: CONFIG.RESTUser,
        password: CONFIG.RESTPassword
      }
    };
    request.get(options, function(err, res, body){
      if(err) {
        reject(new Error(err));
        return;
      }

      if(body.toString() == 'Unauthorized'){
        reject(new Error('MI5REST: wrong username and password, \n body:', body));
        return;
      }

      resolve([res, body]);
    });
  });
};

mi5rest.prototype.getLastRecommendation = function(){
  var self = instance;

  var options = {
    url: CONFIG.RESTHost+'/getLastRecommendation',
    rejectUnauthorized: false,
    auth: {
      user: CONFIG.RESTUser,
      password: CONFIG.RESTPassword
    }
  };

  return Q.promise(function(resolve, reject){
    request.get(options, function(err, res){
      if(!err){
        // check res
        if(res.statusCode != 200) {
          reject(new Error('statusCode is not ok \n res:' + JSON.stringify(res, '\n')));
        } else {
          // all fine
          console.log('rest get last recommendation: '+res.body);
          resolve(res.body);
        }
      } else {
        reject(new Error(err));
      }
    });
  });
};