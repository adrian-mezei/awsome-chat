# Awesome chat

This repository contains an example chat application using AWS services.

## Useful commands

```bash
# install dependencies
$ npm install

# compile ts files to js files
$ npm run build

# watch for changes and compile them
$ npm run watch

# rebuild and execute all tests
$ npm run test

# rebuild and deploy this stack to your configured (or default) AWS account/region
$ npm run cdk-deploy

# rebuild and compare deployed stack with current state
$ npm run cdk-diff

# rebuild and emit the synthesized CloudFormation template
$ npm run cdk-synth

# bootstrap your AWS account if required and you have not done it before
$ npm run cdk-bootstrap
```

## Deployment

Create a local .env file based on the .env-sample.env and update it with your target deployment account and the AWS CLI profile name to use the proper credentials. Then you can simply deploy with the following command:

```bash
# rebuild and deploy this stack to your configured (or default) AWS account/region
$ npm run cdk-deploy
```

## Development

### Recommended VSCode plugins

-   [DotENV](https://marketplace.visualstudio.com/items?itemName=mikestead.dotenv) for `.env` file syntax highlight.
-   [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) for consistent code formatting.
-   [TSLint](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin) for tslint rule validation.
-   [Todo Tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree) for TODO highlight and collection.
-   [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) for code spell checking
