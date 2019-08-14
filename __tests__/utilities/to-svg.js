const toSVG = require('../../src/utilities/to-svg');
const parser = require('fast-xml-parser');

describe('svg', () => {
  const options = {
    height: 200,
    width : 300,
    r: 4,
    line:{
      width:.5,
      color:'black'
    },
    inputs:{
      color: 'rgba(0, 128, 0, 0.5)',
      label: false
    },
    hidden:{
      color: 'rgba(255, 127, 80, 0.5)',
    },
    outputs:{
      color: 'rgba(100, 149, 237, 0.5)',
    },
    fontSize: "11px"
  };
  describe('check the value returned when sane inputs are provided', () => {
    const network = {
      inputSize: 4,
      hiddenLayers: [3],
      outputSize: 2
    };
    it('should return a string', () => {
      const svgImg = toSVG(network, options);
      expect(typeof(svgImg)).toBe('string');
    });

    it('should return a string starting with "<svg"', () => {
      const svgImg = toSVG(network, options);
      expect(svgImg.slice(0,4)).toBe('<svg');
    });

    it('should return a string ending to "</svg>"', () => {
      const svgImg = toSVG(network, options);
      expect(svgImg.slice(-6)).toBe('</svg>');
    });

    it('should return valid xml when sane inputs provided', () => {
      expect(parser.validate(toSVG(network, options))).toBe(true);
    });
  });

  describe('"network" input', () => {
    it('should not throw an exception when null input size provided', () => {
      const network = {
        inputSize: null,
        hiddenLayers: [3],
        outputSize: 2
      };
      expect(()=>{
        toSVG(network, options);
      }).not.toThrow();
    });

    it('should return false when empty network object provided', () => {
      const empty = {};
      const val = toSVG(empty, options);
      expect(val).toBe(false);
    });
  });

  describe('"options" input', () => {
    it('should not throw an exception when any options missing', () => {
      const noOptions = {};
      const network = {
        inputSize: 4,
        hiddenLayers: [3],
        outputSize: 2
      };
      expect(()=>{
        toSVG(network, noOptions);
      }).not.toThrow();
    });
  });
});
