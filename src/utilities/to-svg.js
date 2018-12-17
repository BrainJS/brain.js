
export default function toSVG(network, options) {
    //default values
    const defaultOptions = {
        line:{
            width: '0.5',
            color: 'black'
        },
        inputs:{
            color:'rgba(0, 128, 0, 0.5)',
            label: false
        },
        outputs:{
            color:'rgba(100, 149, 237, 0.5)'
        },
        hidden:{
            color:'rgba(255, 127, 80, 0.5)'
        },
        fontSize: '14px',
        radius: '8',
        width: '400',
        height: '250'
    };

    const size =  typeof(network.inputSize) == 'number' && typeof(network.outputSize) == 'number' && network.inputSize > 0 && network.outputSize> 0 ? [network.inputSize, ...network.hiddenLayers, network.outputSize]:false;
    options = Object.assign(defaultOptions, options);      
    options.inputs.label = options.inputs.label.length == network.inputSize ? options.inputs.label : false;        
    if(size){
        let svg = '<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="'+options.width+'" height="'+options.height+'">';
        const sh = options.width/size.length;
        size.forEach((neuronsNu,i)=>{
            const sv = options.height/neuronsNu;
            [...Array(neuronsNu)].forEach((_,j)=>{
                if (i==0){
                    svg += '<rect x="'+(sh/2-options.radius)+'" y="' + (sv/2 + j*sv- options.radius) + '" width="'+(2*options.radius)+
                        '" height="'+(2* options.radius)+'" stroke="black" stroke-width="1" fill="'+options.inputs.color+'" />';
                    svg += '<line x1="'+(sh/4)+'" y1="' + (sv/2 + j*sv) + '" x2="'+(sh/2-options.radius)+ '" y2="' + (sv/2 + j*sv) + 
                        '" style="stroke:'+options.line.color+';stroke-width:'+options.line.width+'" />';
                    if(options.inputs.label){
                        svg += '<text x="'+(sh/8)+'" y="' + (sv/2 + j*sv -5 ) + '" fill="black" font-size= "'+options.fontSize+'">'
                        +options.inputs.label[j]+'</text>';
                    }                       
                }else {
                    const sv_1 = options.height/size[i-1];
                    if(i==size.length-1){  
                        svg += '<circle cx="'+(sh/2+i*sh)+'" cy="' + (sv/2 + j*sv) + '" r="'+options.radius+'" stroke="black" stroke-width="1" fill="'+
                        options.outputs.color + '" />';
                        svg += '<line x1="'+(sh/2+i*sh + options.radius)+'" y1="' + (sv/2 + j*sv ) + '" x2="'+(sh/2+i*sh +sh/4)+'" y2="' + (sv/2 + j*sv ) +
                            '" style="stroke:'+options.line.color+';stroke-width:'+options.line.width+'" />';
                    }else{
                        svg += '<circle cx="'+(sh/2+i*sh)+'" cy="' + (sv/2 + j*sv) + '" r="'+options.radius+'" stroke="black" stroke-width="1" fill="'+
                        options.hidden.color + '" />';
                    }
                    for (let k=0;k<size[i-1];k++){
                        svg += '<line x1="'+(sh/2+(i-1)*sh+options.radius)+'" y1="' + (sv_1/2 + k*sv_1) + '" x2="'+(sh/2+i*sh - options.radius)+'" y2="' + (sv/2 + j*sv ) +
                        '" style="stroke:'+ options.line.color+';stroke-width:'+options.line.width+'" />';
                    }
                }
            });
        });        
        svg += '</svg>';
        return svg;
    }else{
        return false;
    }
}