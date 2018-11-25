


(function(exports){

    // your code goes here

    exports.makeSVG = function(size, options){
        // Sanity check
        size = typeof(size) === 'object' && size instanceof Array && size.length >1? size: false;

        // Set options' default values if option missing or invalid
        const lineColor = typeof(options) === 'object' && ('line' in options) && ('color' in options.line) && options.line.color.length>0 ? options.line.color: 'black';
        const lineWidth = typeof(options) === 'object' && ('line' in options) && ('width' in options.line) && options.line.width>0 ? options.line.width: '0.5';
        const inpColor = typeof(options) === 'object' && ('inputs' in options) && ('color' in options.inputs) && options.inputs.color.length>0 ? options.inputs.color: 'rgba(0, 128, 0, 0.5)';
        const outColor = typeof(options) === 'object' && ('outputs' in options) && ('color' in options.outputs) && options.outputs.color.length>0 ? options.outputs.color: 'rgba(100, 149, 237, 0.5)';
        const hiddenColor = typeof(options) === 'object' && ('hidden' in options) && ('color' in options.hidden) && options.hidden.color.length>0 ? options.hidden.color: 'rgba(255, 127, 80, 0.5)';
        const fontSize = typeof(options) === 'object' && ('fontSize' in options) && typeof(options.fontSize)==='string' && options.fontSize.length>2 ? options.fontSize: '12px';
        const radius = typeof(options) === 'object' && ('r' in options) && !isNaN(options.r) ? options.r: '8';
        const width = typeof(options) === 'object' && ('width' in options) && typeof(options.width)=='number'  ? options.width: '400';
        const height = typeof(options) === 'object' && ('height' in options) && typeof(options.height)=='number'  ? options.height: '250';
        
        const inpLabel = typeof(options) === 'object' && ('inputs' in options) && ('label' in options.inputs) && 
                        typeof(options.inputs.label)==='object' && options.inputs.label instanceof Array  && options.inputs.label.length>0 && 
                        size && options.inputs.label.length === size[0] ? options.inputs.label: false;
    
        if(size){
            let svg = '<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="'+width+'" height="'+height+'">'
            const sh = width/size.length;
            size.forEach((neuronsNu,i)=>{
                const sv = height/neuronsNu;
                [...Array(neuronsNu)].forEach((_,j)=>{
                    if (i==0){
                        svg += '<rect x="'+(sh/2-radius)+'" y="' + (sv/2 + j*sv- radius) + '" width="'+(2*radius)+
                            '" height="'+(2* radius)+'" stroke="black" stroke-width="1" fill="'+inpColor+'" />'
                        svg += '<line x1="'+(sh/4)+'" y1="' + (sv/2 + j*sv) + '" x2="'+(sh/2-radius)+ '" y2="' + (sv/2 + j*sv) + 
                            '" style="stroke:'+lineColor+';stroke-width:'+lineWidth+'" />'
                        if(inpLabel){
                            svg += '<text x="'+(sh/8)+'" y="' + (sv/2 + j*sv -5 ) + '" fill="black" font-size= "'+fontSize+'">'
                            +inpLabel[j]+'</text>'
                        }                       
                    }else {
                        const sv_1 = height/size[i-1];
                        if(i==size.length-1){  
                            svg += '<circle cx="'+(sh/2+i*sh)+'" cy="' + (sv/2 + j*sv) + '" r="'+radius+'" stroke="black" stroke-width="1" fill="'+
                                outColor + '" />'
                            svg += '<line x1="'+(sh/2+i*sh + radius)+'" y1="' + (sv/2 + j*sv ) + '" x2="'+(sh/2+i*sh +sh/4)+'" y2="' + (sv/2 + j*sv ) +
                                '" style="stroke:'+lineColor+';stroke-width:'+lineWidth+'" />';
                        }else{
                            svg += '<circle cx="'+(sh/2+i*sh)+'" cy="' + (sv/2 + j*sv) + '" r="'+radius+'" stroke="black" stroke-width="1" fill="'+
                            hiddenColor + '" />'
                        }
                        for (let k=0;k<size[i-1];k++){
                            svg += '<line x1="'+(sh/2+(i-1)*sh+radius)+'" y1="' + (sv_1/2 + k*sv_1) + '" x2="'+(sh/2+i*sh - radius)+'" y2="' + (sv/2 + j*sv ) +
                            '" style="stroke:'+lineColor+';stroke-width:'+lineWidth+'" />';
                        }
                    }
                });
            });
        
            svg += '</svg>'
            return svg
        }else{
            return false
        }
    };

})(typeof exports === 'undefined'? this['svgModule']={}: exports);