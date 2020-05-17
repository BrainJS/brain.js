const brain = require('brain.js');

// create configuration for training
const config = {
  iterations: 15000,
  log: true,
  logPeriod: 500,
  layers: [10],
};

// create data which will be used for training
const data = [
  { input: 'I will write a book.', output: 'future' },
  { input: 'He will be writing a book.', output: 'future' },
  { input: 'They will have written the book.', output: 'future' },
  { input: 'I will not cry.', output: 'future' },
  { input: 'You will find happiness', output: 'future' },
  { input: 'I am about to leave.', output: 'future' },
  { input: 'Will you go out?', output: 'future' },
  { input: 'I shall leave.', output: 'future' },
  { input: 'We will rock you.', output: 'future' },
  { input: 'I shall bring the laptop.', output: 'future' },

  { input: 'Will Smith was late.', output: 'past' },
  { input: 'I had been to that place.', output: 'past' },
  { input: 'I was selfish.', output: 'past' },
  { input: 'We had money.', output: 'past' },
  { input: 'You were so young!', output: 'past' },
  { input: 'It was the best day.', output: 'past' },
  { input: 'What were you saying?', output: 'past' },
  { input: 'I had been to London.', output: 'past' },
  { input: 'I should not have left.', output: 'past' },
  { input: 'What was I thinking?', output: 'past' },

  { input: 'I am here.', output: 'present' },
  { input: 'Are you eating regularly?', output: 'present' },
  { input: 'Let me in.', output: 'present' },
  { input: 'I am running.', output: 'present' },
  { input: 'Please stop screaming.', output: 'present' },
  { input: 'I cannot help you', output: 'present' },
  { input: 'Obey the rules.', output: 'present' },
  { input: 'Call me a lawyer.', output: 'present' },
  { input: 'Am I wrong?', output: 'present' },
  { input: 'Right this way.', output: 'present' },
];

// the thing we would test
const test = 'Will you be my friend?';

const network = new brain.recurrent.LSTM();
network.train(data, config);
const output = network.run(test);
console.log(`Tense: ${output}`);
