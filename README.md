# Awesome chat

This repository contains an example chat application using AWS services.

## Deployment

Create a local .env file based on the .env-sample.env and update it with your target deployment AWS account details and the AWS CLI profile name to use the proper credentials. Make sure that the used AWS account in bootstrapped by cdk (you can do this by `npm run cdk-bootstrap`). Then you can simply deploy with the following command:

```bash
# rebuild and deploy this stack and all of its application elements to your configured (or default) AWS account/region
$ npm run cdk-deploy
```

## Useful development commands

```bash
# install dependencies
$ npm install

# compile ts files to js files
$ npm run build

# compile the stack and all of its application elements
$ npm run build:all

# watch for changes and compile them
$ npm run watch
```

## Useful code quality related commands

```bash
# rebuild and execute all tests
$ npm run test

# execute snapshot test
$ npm run test:snapshot

# update snapshot test snapshot
$ npm run test:snapshot:update

# check or fix formatting issues
$ npm run format:check
$ npm run format

# check code spelling
$ npm run spell
```

## Useful cdk commands

```bash
# rebuild and deploy this stack and all of its application elements to your configured (or default) AWS account/region
$ npm run cdk-deploy

# rebuild and compare deployed stack with current state
$ npm run cdk-diff

# rebuild and emit the synthesized CloudFormation template
$ npm run cdk-synth

# bootstrap your AWS account if required and you have not done it before
$ npm run cdk-bootstrap
```

### Recommended VSCode plugins

-   [DotENV](https://marketplace.visualstudio.com/items?itemName=mikestead.dotenv) for `.env` file syntax highlight.
-   [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) for consistent code formatting.
-   [TSLint](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin) for tslint rule validation.
-   [Todo Tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree) for TODO highlight and collection.
-   [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) for code spell checking
