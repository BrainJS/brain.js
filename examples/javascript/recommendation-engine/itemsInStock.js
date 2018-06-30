const color_black = 1;
const color_blue = 2;
const color_darkblue = 3;
const color_gray = 4;
const color_white = 5;
const color_green = 6;
const color_turqoise = 7;
const color_skin = 8;
const color_lightblue = 9;
const color_lightgreen = 10;

const neckline_round = 1;
const neckline_v = 2;

let itemsInStock = [
	{ 
		trainingInformation: { color: color_black, hasPrinting: 0, neckline: neckline_round, price: 19.99 }, 
		displayingInformation: { imageFile: 'cl_black_nl_circle_hp_false_prc_1999.jpg' }	
	},
	{ 
		trainingInformation: { color: color_blue, hasPrinting: 0, neckline: neckline_round, price: 19.99 },
		displayingInformation: { imageFile: 'cl_blue_nl_circle_hp_false_prc_1999.jpg' } 
	},			
	{ 
		trainingInformation: { color: color_darkblue, hasPrinting: 1, neckline: neckline_round, price: 29.99 }, 
		displayingInformation: { imageFile: 'cl_darkblue_nl_circle_hp_true_prc_2999.jpg' } 
	},			
	{ 
		trainingInformation: { color: color_gray, hasPrinting: 0, neckline: neckline_v, price: 9.99 }, 
		displayingInformation: { imageFile: 'cl_gray_nl_v_hp_false_prc_999.jpg' } 
	},			
	{ 
		trainingInformation: { color: color_white, hasPrinting: 0, neckline: neckline_v, price: 9.99 }, 
		displayingInformation: { imageFile: 'cl_white_nl_v_hp_false_prc_999.jpg' } 
	},			
	{ 
		trainingInformation: { color: color_green, hasPrinting: 0, neckline: neckline_round, price: 17.99 }, 
		displayingInformation: { imageFile: 'cl_green_nl_circle_hp_false_prc_1799.jpg' } 
	},			
	{ 
		trainingInformation: { color: color_blue, hasPrinting: 0, neckline: neckline_round, price: 17.99 }, 
		displayingInformation: { imageFile: 'cl_blue_nl_circle_hp_false_prc_1799.jpg' } 
	},			
	{ 
		trainingInformation: { color: color_turqoise, hasPrinting: 1, neckline: neckline_round, price: 15.99 }, 
		displayingInformation: { imageFile: 'cl_turqoise_nl_circle_hp_true_prc_1599.jpg' }
	},			
	{ 
		trainingInformation: { color: color_skin, hasPrinting: 1, neckline: neckline_round, price: 15.99 }, 
		displayingInformation: { imageFile: 'cl_skin_nl_circle_hp_true_prc_1599.jpg' } 
	},			
	{ 
		trainingInformation: { color: color_darkblue, hasPrinting: 1, neckline: neckline_round, price: 15.99 }, 
		displayingInformation: { imageFile: 'cl_darkblue_nl_circle_hp_true_prc_1599.jpg' } 
	},			
	{ 
		trainingInformation: { color: color_turqoise, hasPrinting: 1, neckline: neckline_round, price: 15.99 }, 
		displayingInformation: { imageFile: 'cl_turqoise_nl_circle_hp_true_prc_1599_1.jpg' } 
	},			
	{ 
		trainingInformation: { color: color_darkblue, hasPrinting: 1, neckline: neckline_round, price: 15.99 }, 
		displayingInformation: { imageFile: 'cl_darkblue_nl_circle_hp_true_prc_1599_1.jpg' } 
	},			
	{ 
		trainingInformation: { color: color_lightblue, hasPrinting: 0, neckline: neckline_round, price: 19.99 }, 
		displayingInformation: { imageFile: 'cl_lightblue_nl_circle_hp_false_prc_1999.jpg' } 
	},			
	{ 
		trainingInformation: { color: color_lightgreen, hasPrinting: 0, neckline: neckline_round, price: 19.99 }, 
		displayingInformation: { imageFile: 'cl_lightgreen_nl_circle_hp_false_prc_1999.jpg' } 
	},			
	{ 
		trainingInformation: { color: color_skin, hasPrinting: 0, neckline: neckline_round, price: 19.99 }, 
		displayingInformation: { imageFile: 'cl_skin_nl_circle_hp_false_prc_1999.jpg' } 
	},			
	{ 
		trainingInformation: { color: color_gray, hasPrinting: 0, neckline: neckline_round, price: 19.99 }, 
		displayingInformation: { imageFile: 'cl_gray_nl_circle_hp_false_prc_1999.jpg' } 
	},			
];
