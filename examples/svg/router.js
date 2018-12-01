
const brain = require('../../index')
const fs = require('fs')
const path = require('path')

// Define the handlers
var handlers = {};

// Index handler
handlers.index = (data, callback)=>{
    // Reject any request that isn't GET
    if(data.method == 'get'){
        const templatesDir = path.join(__dirname,'serversideSVG.html')
        fs.readFile(templatesDir,'utf8',(err,str)=>{
            if(!err && str && str.length> 0){
                callback(200, str, 'html');
            }else{
                callback(501,undefined, 'html')
            }
        });       
    }
}

handlers.svg =function(data, callback){
    if(data.method=='post'){
        const svg = brain.utilities.toSVG(data.payload.network, data.payload.options);
        callback(200,svg,'html');
    }else{
        callback(405);
    }
}

// Public assets
handlers.cssAssets = (data,callback)=>{
    // Reject any request that isn't a GET
    if(data.method){
        // Get the filename been requested
        fileName = data.trimmedPath.trim()
        if(fileName.length > 0){
            // Read the asset's data
            fs.readFile(__dirname+'\\'+ fileName, (err,data)=>{
                if(!err && data){
                    // Determine the content type (default to plain text)
                    let contentType = 'plain';

                    if(fileName.indexOf('.css') > -1){
                        contentType = 'css';
                    }

                    if(fileName.indexOf('.png') > -1){
                        contentType = 'png';
                    }

                    if(fileName.indexOf('.jpg') > -1){
                        contentType = 'jpg';
                    }

                    if(fileName.indexOf('.ico') > -1){
                        contentType = 'favicon';
                    }

                    // Callback the data
                    callback(200, data, contentType)
                }else{
                    callback(405);
                }
            })
           
        }
    }else{
        callback(405);
    }
}

// Not found handler
handlers.notFound = function(data, callback){
    callback(404);
}

// Define a request router
var router = {
    '' : handlers.index,
    'svg' : handlers.svg,
    'cssAssets' : handlers.cssAssets,
    'notFound' : handlers.notFound
}

module.exports = router;