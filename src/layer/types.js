const { Base } = require('./base');
const { Activation } = require('./activation');

class Internal {}
class InternalModel {}
class EntryPoint extends Base {}
class Filter extends Base {}
class Model extends Base {}
class Modifier extends Base {}
class Operator extends Base {}

module.exports = {
  Activation,
  Internal,
  InternalModel,
  EntryPoint,
  Filter,
  Model,
  Modifier,
  Operator,
};
