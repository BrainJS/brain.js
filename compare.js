compare = function(net1, net2, data) {
  var training = data.slice(0, data.length / 2);
  var testing = data.slice(data.length / 2);
  
  net1.train(training);
  net2.train(training);
  
  var error1 = 0, error2 = 0;
  for(var i = 0; i < testing.length; i++) {
    var input = testing[i].input;
    var output1 = net1.run(input);
    var output2 = net2.run(input);

    var expected = testing[i].target;
    for(var id in expected) {
      error1 += Math.abs(expected[id] - output1[id]);
      error2 += Math.abs(expected[id] - output2[id]);
    }
  }

  alert("error in net1: " + error1 + " error in net2: " + error2);
  if(error1 > error2)
    return net2;
  else
    return net1;
}
