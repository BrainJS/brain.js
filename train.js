$(document).ready(function(){
  trainer.changeColor();
  $("#training-message").hide();
  $("#testing-box").hide();
  $("#code-box").hide();
});

var utils = {
  randomColor : function() {
    return { r: Math.round(Math.random() * 255), 
             g: Math.round(Math.random() * 255),
             b: Math.round(Math.random() * 255)};
  },

  toRgb : function(color) {
    return "rgb(" + color.r + "," + color.g + "," + color.b + ")";
  },

  normalize : function(color) {
    return { r: color.r / 255, g: color.g / 255, b: color.b / 255 };
  }
}

var trainer = {
  currentColor : utils.randomColor(),

  data : [],

  pickSwatch : function(color) {
    this.data.push({ input: utils.normalize(this.currentColor),
                    target: { black : color == 'black' ? 1 : 0}});
    this.changeColor();
  },

  changeColor : function() {
    this.currentColor = utils.randomColor(); 
    var rgb = utils.toRgb(this.currentColor);
    $(".swatch").css("backgroundColor", rgb);
  },

  trainNetwork : function() {
    $("#training-box").hide();
    $("#training-message").show();

    if(window.Worker && 
       !(/chrome/.test(navigator.userAgent.toLowerCase()))) {
      // in Chrome "new Worker" never returns
      var worker = new Worker("training-worker.js");
      worker.onmessage = tester.loadNetwork;
      worker.onerror = this.onError;
      worker.postMessage(JSON.stringify(this.data));
    }
    else {
      var net = new NeuralNetwork();
      var iterations = 8000;
      var error = net.train(this.data, iterations);
      tester.show(net);
    }
  },

  onError : function(event) {
    $("#training-message").text("error training network: " + event.message);
  }
}

var tester = {
  loadNetwork : function(event) {
    var net = new NeuralNetwork().fromJSON(JSON.parse(event.data));
    tester.show(net);
  },

  show : function(net) {
    $("#training-message").hide();
    runNetwork = net.toFunction();
    runNetwork.name = "runNetwork"; // for view code later
    this.testRandom();
    $("#testing-box").show();
  },

  testRandom : function() {
    this.testColor(utils.randomColor());
  },

  testColor : function(color) {
    var rgb = utils.toRgb(color);
    $(".swatch").css("backgroundColor", rgb);

    var color = utils.normalize(color);
    $("#nn-swatch").css("color", this.nnColor(color));
    $("#wcag-swatch").css("color", this.wcagColor(color));
  },

  nnColor : function(bgColor) {
    var output = runNetwork(bgColor);
    if(output.black > .5)
      return 'black';
    return 'white';
  },

  wcagColor : function(bgColor) {
    if(contrast(bgColor, {r: 1, g: 1, b: 1}) 
        > contrast(bgColor, {r: 0, g: 0, b: 0}))
      return 'white';
    return 'black';
  },

  viewCode : function(type) {
    if(type == 'nn') {   
      var code = "var textColor = " + this.nnColor.toString()
                  + "\n\nvar runNetwork = " + runNetwork.toString();
      $("#code-header").text("neural network code:");
    }
    else {
      var code = "var textColor = " + this.wcagColor.toString()
                  + "\n\nvar contrast = " + contrast.toString()
                  + "\n\nvar luminosity = " + luminosity.toString();
      $("#code-header").text("luminosity algorithm code:");
    }
    $("#code-box").show();
    $("#code-box").text(code);
  }
}

/* these functions are outside so we can just call toString() for 'view code'*/
var luminosity = function(color) {
  var r = color.r, g = color.g, b = color.b;
  var red = (r <= 0.03928) ? r/12.92 : Math.pow(((r + 0.055)/1.055), 2.4);
  var green = (g <= 0.03928) ? g/12.92 : Math.pow(((g + 0.055)/1.055), 2.4);
  var blue = (b <= 0.03928) ? b/12.92 : Math.pow(((b + 0.055)/1.055), 2.4);

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

var contrast = function(color1, color2) {
  var lum1 = luminosity(color1);
  var lum2 = luminosity(color2);
  if(lum1 > lum2)
    return (lum1 + 0.05) / (lum2 + 0.05);
  return (lum2 + 0.05) / (lum1 + 0.05);
}
