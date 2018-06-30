Thanks for taking the time to contribute to brain.js. Follow these guidelines to make the process smoother:

1.  One feature per pull request. Each PR should have one focus, and all the code changes should be supporting that one feature or bug fix. Using a [separate branch](https://guides.github.com/introduction/flow/index.html) for each feature should help you manage developing multiple features at once.

2.  This repository uses `.editorconfig`, `eslint` (`airbnb`) and `prettier` for linting and formating to make coding style consistent thorught the repository. For this purpose, some helpfull scripts are also defined in project;

```bash
npm run eslint # validate eslint rules
npm run eslint:fix # validates and fix any fixable issues
npm run prettier # format files
```

3.  Add/update a test for the feature or fix, if possible. See the `__tests__` directory for existing tests. To run these tests:

```bash
npm run test # run tests and generate coverage docs
npm run test:watch # run jest in watch mode
```

4.  Please donot run build/dist script and donot bump version number for the script. These things will be handled by the maintainers when necessary.
