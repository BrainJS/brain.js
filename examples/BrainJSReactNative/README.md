# brain.js React Native Examples

In this project, you will find an trained-model.json file as well as, a index.js file. You may use the index.js file to train new models, currently this example, is trained on 10 different Drake songs, and 10 different Eminem songs. The example demonstrates how a muti-layer Neural Network, is able to classify the artist, by analysing song lyrics.

# Files

 - index.js
 - trained-model.json
 
# BrainJSReactNativeExampleApp

 In the above mentioned directory, you will find a working react native example app, the takes in song lyrics, and classifies them accordantly.

# Setting up a new React Native project to work with brain.js

 1. npm install brain.js --save (within the react native directory)
 2. navigate to the package install in your node modules folder, navigate to index.js file under brain.js --> dist and remove the require statement for stream, it should look like this:

    var _stream = require('stream');
    
(don't worry about removing this, this is a dependant library for the training aspect of brain.js, but we won't be training on the user's phone, so this is not needed.

