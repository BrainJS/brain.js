# tests

To run the tests in this directory, make sure you've installed the dev dependencies with this command from the top-level directory:

```
npm install
```

You'll also have to globally install [mocha](http://visionmedia.github.com/mocha/). `npm install mocha -g`.

# Unit tests
Run the unit tests with:

```
mocha test/unit/*
```

# Cross-validation tests
The cross-validation tests will actually test how good the neural network is a training by getting a bunch of training data, training it with some, and using the rest as verification.

Cross-validation tests will take a long time to run, and in the end will give you a printout with the average error of the test data.

Run these with:

```
mocha test/cross-validation/* --timeout 10000
```
