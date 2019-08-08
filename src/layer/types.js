const { Base } = require('./base');

class Activation extends Base {}
class Internal {}
class Filter extends Base {}
class Model extends Base {}
class Modifier extends Base {}
class Operator extends Base {}

module.exports = { Activation, Internal, Filter, Model, Modifier, Operator };
