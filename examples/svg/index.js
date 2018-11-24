/*
 * 1st assignment
 * 
 */
 

 // Dependencies

 var http = require('http');
 var listener = require('./listener.js');
 var router = require('./router.js');

var server = http.createServer(function(req,res){
   listener(router,req,res);
})

server.listen(3000,function(){
    console.log('The server is listening on port 3000')
})

