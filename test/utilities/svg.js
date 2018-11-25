/*
 * Testing creation of svg image. Size and options are given as inputs.
 *
 */

import assert from 'assert';
import svg from '../../src/utilities/svg';

describe('svg', () => {
    let size = [4,3,2];
    
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
    }

    describe('check the value returned when sane inputs are provided', () => {
       
        it('should return a string', () => {
            const svgImg = svg.makeSVG(size,options)
            assert.ok(typeof(svgImg) === 'string');
        });

        it('should return a string starting with "<svg"', () => {
            const svgImg = svg.makeSVG(size,options)
            assert.equal(svgImg.slice(0,4) , '<svg');
        });
        
        it('should return a string ending to "</svg>"', () => {
            const svgImg = svg.makeSVG(size,options)
            assert.equal(svgImg.slice(-6) , '</svg>');
        });    
        
        // it('should return valid xml when sane inputs provided', () => {
        //     const svgImg = svg.makeSVG(size,options)
        //     expect(svgImg).xml.to.be.valid();
        // });
    });
    
    describe('"size" input', () => {

        it('should not throw an exception when size is not an array', () => {
            const sizeNotAnArray = 5
            assert.doesNotThrow(()=>{
                const val = svg.makeSVG(sizeNotAnArray,options);
            },TypeError)
        });        
        
        it('should return false when size length is smaller than 2', () => {
            const empty = []
            const val = svg.makeSVG(empty,options)
            assert.ok(val === false);
        });
    });
    
    
    describe('"options" input', () => {

        it('should not throw an exception when any options missing', () => {
            const noOptions = {}
            size = [4,3,2];
            assert.doesNotThrow(()=>{
                const val = svg.makeSVG(size,noOptions);
            },TypeError)
        });
    });
})
