/*
 * Testing creation of svg image. Size and options are given as inputs.
 *
 */

import assert from 'assert';
import toSVG from '../../src/utilities/to-svg';
var parser = require('fast-xml-parser');

describe('svg', () => {
    let network = {
            inputSize: 4,
            hiddenLayers: [3],
            outputSize: 2
    };
    
    let options = {
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
       
        it('should return a string', () => {
            const svgImg = toSVG(network,options);
            assert.ok(typeof(svgImg) === 'string');
        });

        it('should return a string starting with "<svg"', () => {
            const svgImg = toSVG(network,options);
            assert.equal(svgImg.slice(0,4) , '<svg');
        });
        
        it('should return a string ending to "</svg>"', () => {
            const svgImg = toSVG(network,options);
            assert.equal(svgImg.slice(-6) , '</svg>');
        });    
        
        it('should return valid xml when sane inputs provided', () => {
            assert.ok(parser.validate(toSVG(network,options))===true);
        });
    });
    
    describe('"network" input', () => {

        it('should not throw an exception when null input size provided', () => {
            const network = {
                inputSize: null,
                hiddenLayers: [3],
                outputSize: 2
            };
            assert.doesNotThrow(()=>{
                const val = toSVG(network,options);
            },TypeError)
        });        
        
        it('should return false when empty network object provided', () => {
            const empty = {}
            const val = toSVG(empty,options)
            assert.ok(val === false);
        });
    });
    
    
    describe('"options" input', () => {

        it('should not throw an exception when any options missing', () => {
            const noOptions = {}
            network = {
                inputSize: 4,
                hiddenLayers: [3],
                outputSize: 2
            };
            assert.doesNotThrow(()=>{
                const val = toSVG(network,noOptions);
            },TypeError)
        });
    });
})
