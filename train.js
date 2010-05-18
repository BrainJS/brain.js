$(document).ready(function(){
  trainer.changeColor();
  $("#training-message").hide();
  $("#testing-box").hide();
});

var utils = {
  randomColor : function() {
    return { red: Math.round(Math.random() * 255), 
             green: Math.round(Math.random() * 255),
             blue: Math.round(Math.random() * 255)};
  },

  toRgb : function(color) {
    return "rgb(" + color.red + "," + color.green + "," + color.blue + ")";
  },

  normalize : function(color) {
    return { red: color.red / 255, green: color.green / 255, blue: color.blue / 255 };
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
    $("#black-swatch").css("backgroundColor", rgb);
    $("#white-swatch").css("backgroundColor", rgb);
  },

  trainNetwork : function() {
    $("#training-box").hide();
    $("#training-message").show();

    if(window.Worker && $.browser.mozilla) {
      // in Chrome 5 on Linux, "new Worker" never returns - wtf
      var worker = new Worker("training-worker.js");
      worker.onmessage = tester.show;
      worker.onerror = this.onError;
      worker.postMessage(this.data);
    }
    else {
      var net = new NeuralNetwork();
      var iterations = 10000;
      var error = net.train(this.data, iterations);
      tester.show({data: net.toFunction().toString()});
    }
  },

  onError : function(event) {
    $("#training-message").text("error training network: " + event.message);
  }
}

var tester = {

  show : function(event) {
    $("#training-message").hide();
    tester.runNetwork = new Function("return " + event.data)();
    $("#testing-box").show();
  },

  testRandom : function() {
    this.testColor(utils.randomColor());
  },

  testColor : function(color) {
    var rgb = utils.toRgb(color);
    $("#nn-swatch").css("backgroundColor", rgb);
    $("#wcag-swatch").css("backgroundColor", rgb);

    $("#nn-swatch").css("color", this.nnText(color));
    $("#wcag-swatch").css("color", this.wcagText(color));  
  },

  nnText : function(color) {
    return this.runNetwork(utils.normalize(color)).black > .5 ? 'black' : 'white';
  },

  wcagText : function(color) {
    if(this.contrast(color, {red: 255, green: 255, blue: 255}) 
        > this.contrast(color, {red: 0, green: 0, blue: 0}))
      return 'white';
    return 'black';
  },

  luminosity : function(color) {
    var color = utils.normalize(color);
    var r = color.red, g = color.green, b = color.blue;
    var red = (r <= 0.03928) ? r/12.92 : Math.pow(((r + 0.055)/1.055), 2.4);
    var green = (g <= 0.03928) ? g/12.92 : Math.pow(((g + 0.055)/1.055), 2.4);
    var blue = (b <= 0.03928) ? b/12.92 : Math.pow(((b + 0.055)/1.055), 2.4);

    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  },

  contrast : function(color1, color2) {
    var lum1 = this.luminosity(color1);
    var lum2 = this.luminosity(color2);
    if(lum1 > lum2)
      return (lum1 + 0.05) / (lum2 + 0.05);
    return (lum2 + 0.05) / (lum1 + 0.05);
  }
}

