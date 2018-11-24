/*
 * Receive request, choose routing handler and route
 * 
 */

// Dependencies
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

parseJsonToObject =function(str){
    try{
        const obj = JSON.parse(str)
        return obj;
    }catch(e){
        return {};
    }
}

const bufferPayload = function(req,callback){
    // Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';

    req.on('data',function(data){
        buffer += decoder.write(data);
    });
    req.on('end',function(){
        buffer += decoder.end();
        
        callback(buffer)
    })
}

const listenerMethod   = function(router,req,res){
     
    // Get the URL and parse it
    const parsedUrl = url.parse(req.url,true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    const queryStringObject = parsedUrl.query;

    // Get the http method
    const method = req.method.toLowerCase();

    // Get the headers as an object
    const headers = req.headers;

    // Construct the data-object to send to the handler
    const data = {
        'trimmedPath' : trimmedPath,
        'queryStringObject' : queryStringObject,
        'method': method,
        'headers': headers
    };

    // Choose the handler the request should go to. If one is not found, use the notFound handler.
    let chosenHandler = typeof(router[trimmedPath])!= 'undefined'? router[trimmedPath]:router['notFound'];

    chosenHandler = trimmedPath.indexOf('.css') > -1 ? router['cssAssets'] : chosenHandler;

    bufferPayload(req,function(buffer){
        
        data.payload = parseJsonToObject(buffer);

        // Route the request to the chosen handler  
        chosenHandler(data, function(statusCode, payload, contentType){
            
            // Determine the type of response (fallback to Json)
            contentType = typeof(contentType) == 'string' ? contentType : 'json';
            
            // Use the status code called back by the handler or default to 200
            statusCode= typeof(statusCode) == 'number'? statusCode:200;

            // Write response parts that are content specific
            let payloadString = '';

            if(contentType== 'json'){
                res.setHeader('Content-Type', 'application/json');
                payload = typeof(payload) == 'object' ? payload :{};
                payloadString = JSON.stringify(payload);
            }
            if(contentType == 'html'){
                res.setHeader('Content-Type', 'text/html');
                payloadString = typeof(payload) == 'string' ? payload :'';
            }
            if(contentType == 'favicon'){
                res.setHeader('Content-Type', 'image/x-icon');
                payloadString = typeof(payload) !== 'undefined' ? payload :'';
            }
            if(contentType == 'css'){
                res.setHeader('Content-Type', 'text/css');
                payloadString = typeof(payload) !== 'undefined' ? payload :'';
            }
            if(contentType == 'png'){
                res.setHeader('Content-Type', 'image/png');
                payloadString = typeof(payload) !== 'undefined' ? payload :'';
            }
            if(contentType == 'jpg'){
                res.setHeader('Content-Type', 'image/jpg');
                payloadString = typeof(payload) !== 'undefined' ? payload :'';
            }
            if(contentType == 'plain'){
                res.setHeader('Content-Type', 'text/plain');
                payloadString = typeof(payload) !== 'undefined' ? payload :'';
            }            
            
            // Write response parts that are common to all content-types
            res.writeHead(statusCode);
            res.end(payloadString)
        })
    });
}

module.exports = listenerMethod;