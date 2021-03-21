import { expect as expectCDK, matchTemplate, MatchStyle, SynthUtils } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { Stack } from '@aws-cdk/core';
import * as App from '../lib/app-stack';

test('Test Stack', () => {
    const app = new cdk.App();

    const stack = new App.AwesomeChatStack(app, 'MyTestStack');

    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
