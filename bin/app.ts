#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwesomeChatStack } from '../lib/app-stack';

const app = new cdk.App();
new AwesomeChatStack(app, 'AppStack', {
    env: {
        account: process.env.CDK_DEPLOY_ACCOUNT,
        region: process.env.CDK_DEPLOY_REGION,
    },
});
