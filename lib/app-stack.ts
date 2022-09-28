import * as Lambda from '@aws-cdk/aws-lambda';
import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import * as ApiGW from '@aws-cdk/aws-apigatewayv2';
import * as ApiGWI from '@aws-cdk/aws-apigatewayv2-integrations';
import * as Iam from '@aws-cdk/aws-iam';
import * as S3 from '@aws-cdk/aws-s3';
import * as S3Deployment from '@aws-cdk/aws-s3-deployment';
import * as Logs from '@aws-cdk/aws-logs';
import * as DDB from '@aws-cdk/aws-dynamodb';

export class AwesomeChatStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const lambdaFunction = this.createLambdaFunction();
        const { webSocketApi, webSocketApiStage } = this.createApiGateway(lambdaFunction);

        const s3Bucket = this.createS3Bucket();

        const dynamoDBTable = this.createDynamoDBTable();

        this.updateLambdaFunction(lambdaFunction, webSocketApi, webSocketApiStage, dynamoDBTable);
    }

    createLambdaFunction(): Lambda.Function {
        const lambdaFunction = new Lambda.Function(this, 'WebSocketHandler', {
            runtime: Lambda.Runtime.NODEJS_16_X,
            handler: 'index.handler',
            code: Lambda.Code.fromAsset(path.join(__dirname, './../app/backend/bundle')),
            logRetention: Logs.RetentionDays.THREE_DAYS,
        });

        lambdaFunction.grantInvoke(new Iam.ServicePrincipal('apigateway.amazonaws.com'));

        return lambdaFunction;
    }

    updateLambdaFunction(
        lambdaFunction: Lambda.Function,
        webSocketApi: ApiGW.WebSocketApi,
        webSocketApiStage: ApiGW.WebSocketStage,
        dynamoDBTable: DDB.Table,
    ): void {
        lambdaFunction.addEnvironment(
            'APIGW_ENDPOINT',
            `https://${webSocketApi.apiId}.execute-api.${this.region}.amazonaws.com/${webSocketApiStage.stageName}`,
        );

        lambdaFunction.addToRolePolicy(
            new Iam.PolicyStatement({
                actions: ['execute-api:ManageConnections'],
                resources: [
                    `arn:aws:execute-api:${this.region}:${this.account}:${webSocketApi.apiId}/${webSocketApiStage.stageName}/POST/*`,
                ],
            }),
        );

        lambdaFunction.addEnvironment('TABLE_NAME', dynamoDBTable.tableName);

        lambdaFunction.addToRolePolicy(
            new Iam.PolicyStatement({
                actions: ['dynamodb:DeleteItem', 'dynamodb:Scan', 'dynamodb:PutItem'],
                resources: [`arn:aws:dynamodb:${this.region}:${this.account}:table/${dynamoDBTable.tableName}`],
            }),
        );
    }

    createApiGateway(
        lambdaFunction: Lambda.Function,
    ): { webSocketApi: ApiGW.WebSocketApi; webSocketApiStage: ApiGW.WebSocketStage } {
        const webSocketApi = new ApiGW.WebSocketApi(this, 'web-socket-api', {
            connectRouteOptions: {
                integration: new ApiGWI.WebSocketLambdaIntegration('web-socket-api-connect', lambdaFunction),
            },
            disconnectRouteOptions: {
                integration: new ApiGWI.WebSocketLambdaIntegration('web-socket-api-disconnect', lambdaFunction),
            },
            defaultRouteOptions: {
                integration: new ApiGWI.WebSocketLambdaIntegration('web-socket-api-default', lambdaFunction),
            },
        });

        const webSocketApiStage = new ApiGW.WebSocketStage(this, 'web-socket-api-stage', {
            webSocketApi,
            stageName: 'prod',
            autoDeploy: true,
        });

        return { webSocketApi, webSocketApiStage };
    }

    createS3Bucket(): S3.Bucket {
        const bucket = new S3.Bucket(this, 's3-static-website-bucket', {
            publicReadAccess: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            websiteIndexDocument: 'index.html',
        });

        new S3Deployment.BucketDeployment(this, 's3-static-website-deployment', {
            sources: [S3Deployment.Source.asset(path.join(__dirname, './../app/frontend'))],
            destinationBucket: bucket,
        });

        return bucket;
    }

    createDynamoDBTable(): DDB.Table {
        return new DDB.Table(this, 'dynamodb-table', {
            partitionKey: { name: 'connectionId', type: DDB.AttributeType.STRING },
            billingMode: DDB.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            tableName: 'chat-app-table',
        });
    }
}
