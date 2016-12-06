import fs from 'fs';
import assert from 'assert';
import RNN from '../../../src/recurrent/rnn';
import Vocab from '../../../src/utilities/vocab';
var vocab = new Vocab(['0','1','2','3','4','5','6','7','8','9','+','=']);

describe('json', () => {
  describe('#toJSON', () => {
    it('can export model as json', () => {
      var net = new RNN({
        inputSize: 6,
        inputRange: 12,
        outputSize: 6
      });
      var json = net.toJSON();

      compare(json.input, net.model.input);
      net.model.hiddenLayers.forEach((layer, i) => {
        compare(json.hiddenLayers[i].weight, layer.weight);
        compare(json.hiddenLayers[i].transition, layer.transition);
        compare(json.hiddenLayers[i].bias, layer.bias);
      });
      compare(json.output, net.model.output);
      compare(json.outputConnector, net.model.outputConnector);

      function compare(left, right) {
        left.weights.forEach((value, i) => {
          assert.equal(value, right.weights[i]);
        });
        assert.equal(left.rows, right.rows);
        assert.equal(left.columns, right.columns);
      }
    });
  });

  describe('#fromJSON', () => {
    it('can import model from json', () => {
      var jsonString = JSON.stringify(new RNN({
        inputSize: 6, //<- length
        inputRange: vocab.characters.length,
        outputSize: vocab.characters.length //<- length
      }).toJSON());

      var clone = new RNN({ json: JSON.parse(jsonString) });

      assert.equal(jsonString, JSON.stringify(clone.toJSON()));
      assert.equal(clone.inputSize, 6);
      assert.equal(clone.inputRange, vocab.characters.length);
      assert.equal(clone.outputSize, vocab.characters.length);
    });

    it('can import model from json and train again', () => {
      var jsonString = JSON.stringify(new RNN({
        inputSize: 6, //<- length
        inputRange: vocab.characters.length,
        outputSize: vocab.characters.length //<- length
      }).toJSON());

      var clone = new RNN({ json: JSON.parse(jsonString) });
      clone.trainPattern([0, 1, 2, 3, 4, 5]);

      assert.notEqual(jsonString, JSON.stringify(clone.toJSON()));
      assert.equal(clone.inputSize, 6);
      assert.equal(clone.inputRange, vocab.characters.length);
      assert.equal(clone.outputSize, vocab.characters.length);
    });
  });
});