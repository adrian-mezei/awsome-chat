import * as dotenv from 'dotenv';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';

dotenv.config();
AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: process.env.AWS_PROFILE });
AWS.config.region = process.env.CDK_DEPLOY_REGION;

const ApiGW = new AWS.ApiGatewayV2();
const S3 = new AWS.S3();

(async function upload() {
    const apis = await ApiGW.getApis().promise();
    const api = apis.Items?.find(x => x.Name === 'web-socket-api');

    if (api && api.ApiId) {
        const apiStageResponse = await ApiGW.getStages({ ApiId: api.ApiId }).promise();
        if (apiStageResponse.Items) {
            const apiStage = apiStageResponse.Items[0];

            const configTpl = fs.readFileSync('./app/frontend/config.tpl', { encoding: 'utf8', flag: 'r' });
            const config = configTpl
                .replace('${api_id}', api.ApiId)
                .replace('${region}', process.env.CDK_DEPLOY_REGION!)
                .replace('${stage}', apiStage.StageName);

            const buckets = await S3.listBuckets().promise();
            const bucket = buckets.Buckets?.find(b => b.Name?.includes('s3staticwebsitebucket'));

            if (bucket && bucket.Name) {
                await S3.upload({ Bucket: bucket.Name, Key: 'config.js', Body: config }).promise();

                console.log(`http://${bucket.Name}.s3-website.${process.env.CDK_DEPLOY_REGION}.amazonaws.com/`);
            }
        }
    }
})();
