var Q = require('q');
var _ = require('underscore');

mi5database = function() {
  this.mongoose = require('mongoose-q')();

  mi5Logger.info('Mi5 - Database loaded');

  // Connect to database
  try {
    this.mongoose.connect(CONFIG.DatabaseHost);
  } catch(err){
    console.log(err);
  }
  mi5Logger.info('Database connected');

  // Create the Order-Schemea
  var orderSchema = this.mongoose.Schema({
    taskId          : Number
    , recipeId      : Number
    , parameters    : [Number]
    , date          : { type: Date, default: Date.now }
  });
  this.Order = this.mongoose.model('Order', orderSchema);

  var recommendationSchema = this.mongoose.Schema({
    productId: Number,
    timestamp: Date,
    recipe: this.mongoose.Schema.Types.Mixed,
    order: this.mongoose.Schema.Types.Mixed,
    review: this.mongoose.Schema.Types.Mixed,
    recommendation: this.mongoose.Schema.Types.Mixed
  });
  this.Recommendation = this.mongoose.model('Recommendation', recommendationSchema);

};
var instance = new mi5database(); //TODO see why scope doesn't work when calling it on a promise.then(promise)
exports.instance = instance;

/**
 * Save an order
 *
 * @param taskId [int]
 * @param recipeId [int]
 * @param userParameters [array_handlePostParameters]
 * @returns Promise
 */
mi5database.prototype.saveOrder = function(taskId, recipeId, userParameters){
  var self = instance;

  var order = {taskId: taskId,
              recipeId: recipeId,
              parameters: userParameters};

  var NewOrder = new self.Order(order);
  mi5Logger.info('new order:'+order);
  return NewOrder.saveQ();
};

mi5database.prototype.saveRecommendation = function(recommendation){
  var self = instance;

  var NewRecommendation = new self.Recommendation(recommendation);
  mi5Logger.info('new recommendation saved:'+recommendation);
  return NewRecommendation.saveQ();
}

mi5database.prototype.getRecommendation = function(taskId){
  var self = instance;
  var deferred = Q.defer();

  self.Recommendation.find({'productId': taskId}).limit(1).exec(function(err, post){
    if(err) deferred.reject(err);

    deferred.resolve(post.pop());
  });

  return deferred.promise;
}

/**
 * Returns a promised-order object
 * @param taskId
 * @returns {*|promise}
 */
mi5database.prototype.getOrder = function(taskId){
  var self = instance;
  var deferred = Q.defer();

  self.Order.find({'taskId': taskId}).limit(1).exec(function(err, post){
    if(err) deferred.reject(err);

    deferred.resolve(post.pop());
  });

  return deferred.promise;
};

/**
 * Returns a promised-order task object
 *
 * @returns {*|promise}
 */
mi5database.prototype.getLastTaskId = function(){
  var self = instance;
  var deferred = Q.defer();

  //var lastTaskId = self.Order.findQ().sort({_id:-1}).limit(1);
  self.Order.find().sort({'taskId': -1}).limit(1).exec(function(err, post){
    if(err) deferred.reject(err);
    if(false ===_.isEmpty(post)){
      // post[0].taskId == [1456]? -> parse to int
      var taskId = parseInt(post.pop().taskId,10);
      deferred.resolve(taskId);
    } else {
      deferred.reject('no task has been found');
    }
  });

  return deferred.promise;
};

mi5database.prototype.getLastOrder = function(){
  var self = instance;

  return self.getLastTaskId().then(self.getOrder);
}