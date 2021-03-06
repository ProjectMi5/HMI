/**
 * Recipe View Router
 */

function taskList(req, res) {
  var jadeData = new Object;

  // recipeIdArray = [ 0, 1 ];
  // recipeInterface.getRecipes(recipeIdArray, function(err, recipes) {
  mi5TaskInterface.getTaskListActive(function(taskList) {
    jadeData.tasks = taskList

    taskSockets = _.once(mi5TaskInterface.ioRegister)
    io.on('connection', function(socket) {
      socket.join(mi5TaskInterface.socketRoom);
      taskSockets(socket);
    })

    res.render('sbadmin2/tasks', jadeData);
    res.end();
  });
}
exports.taskList = taskList;