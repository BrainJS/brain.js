$(document).ready(function(){
  trainer.changeColor();
  $("#progress-box").hide();
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

  iterations : 9000,

  pickSwatch : function(color) {
    var result = { input: utils.normalize(this.currentColor),
                   output: { black : color == 'black' ? 1 : 0}};
    this.data.push(result);

    /* $.ajax({url: 'http://localhost:5984/blackorwhite/', type: 'POST', 
             data: JSON.stringify(result)}); */ // collect training data on the server side
    this.changeColor();
  },

  changeColor : function() {
    this.currentColor = utils.randomColor(); 
    var rgb = utils.toRgb(this.currentColor);
    $(".swatch").css("backgroundColor", rgb);
  },

  trainNetwork : function() {
    $("#training-box").hide();
    $("#progress-box").show();

    if(window.Worker && 
       !(/chrome/.test(navigator.userAgent.toLowerCase()))) {
      // in Chrome "new Worker" never returns
      var worker = new Worker("training-worker.js");
      worker.onmessage = this.onMessage;
      worker.onerror = this.onError;
      worker.postMessage(JSON.stringify(this.data));
    }
    else {
      var net = new NeuralNetwork();
      net.train(this.data, this.iterations, 0.005, this.showProgress, 1000);
      tester.show(net);
    }
  },

  onMessage : function(event) {
    var data = JSON.parse(event.data);
    if(data.type == 'progress') {
      trainer.showProgress(data);
    }
    else if(data.type == 'result') {
      var net = new NeuralNetwork().fromJSON(data.net);
      tester.show(net);
    }
  },

  onError : function(event) {
    $("#training-message").text("error training network: " + event.message);
  },

  showProgress : function(progress) {
    var completed = progress.iterations / trainer.iterations * 100;
    $("#progress-completed").css("width", completed + "%");
  }
}

var tester = {
  show : function(net) {
    $("#progress-box").hide();
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
    $("#nn-swatch").css("color", nnColor(color));
    $("#wcag-swatch").css("color", wcagColor(color));
  },

  viewCode : function(type) {   
    if(type == 'nn' && !$("#nn-swatch-box").hasClass("selected")) {
      $("#code-header").text("neural network code:");
      var code = "var textColor = " + nnColor.toString()
                  + "\n\nvar runNetwork = " + runNetwork.toString();
      $("#code").text(code);
      $(".swatch-box").removeClass("selected");
      $("#nn-swatch-box").addClass("selected");
      $("#code-box").show();
    }
    else if(type == 'wcag' && !$("#wcag-swatch-box").hasClass("selected")) {
      $("#code-header").text("luminosity algorithm code:");
      var code = "var textColor = " + wcagColor.toString()
                  + "\n\nvar contrast = " + contrast.toString()
                  + "\n\nvar luminosity = " + luminosity.toString();
      $("#code").text(code);
      $(".swatch-box").removeClass("selected");
      $("#wcag-swatch-box").addClass("selected");
      $("#code-box").show();
    }
    else {
      $("#code-box").hide();
      $(".swatch-box").removeClass("selected");
    }
  }
}


/* these functions are outside so we can just call toString() for 'view code'*/
var nnColor = function(bgColor) {
  var output = runNetwork(bgColor);
  if(output.black > .5)
    return 'black';
  return 'white';
}

var wcagColor = function(bgColor) {
  if(contrast(bgColor, {r: 1, g: 1, b: 1}) 
      > contrast(bgColor, {r: 0, g: 0, b: 0}))
    return 'white';
  return 'black';
}

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
