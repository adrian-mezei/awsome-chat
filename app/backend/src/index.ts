import * as AWS from 'aws-sdk';

const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

export const handler = async (event: any, context: any): Promise<any> => {
    console.log(event);

    const {
        requestContext: { connectionId, routeKey },
        body,
    } = event;

    if (routeKey === '$connect') return handleConnect(connectionId);
    if (routeKey === '$disconnect') return handleDisconnect(connectionId);

    const parsedBody = JSON.parse(body);
    console.log(parsedBody);
    return handleDefault(connectionId, parsedBody);
};

async function handleConnect(connectionId: string) {
    const putParams = {
        TableName: process.env.TABLE_NAME!,
        Item: { connectionId },
    };

    try {
        await ddb.put(putParams).promise();
    } catch (err) {
        console.log(err);
        return { statusCode: 500, body: 'Failed to connect.' };
    }

    return { statusCode: 200, body: `Connected.` };
}

async function handleDisconnect(connectionId: string) {
    const deleteParams = {
        TableName: process.env.TABLE_NAME!,
        Key: { connectionId },
    };

    try {
        await ddb.delete(deleteParams).promise();
    } catch (err) {
        console.log(err);
        return { statusCode: 500, body: 'Failed to disconnect.' };
    }

    return {
        statusCode: 200,
        body: `Disconnected.`,
    };
}

async function handleDefault(
    connectionIdSender: string,
    parsedBody: { message: string; senderName: string; senderGravatar: string },
) {
    let connectionData;

    try {
        connectionData = await ddb.scan({ TableName: process.env.TABLE_NAME! }).promise();
    } catch (e) {
        console.log(e);
        return { statusCode: 500, body: 'Operation failed.' };
    }

    const apiGW = new AWS.ApiGatewayManagementApi({
        endpoint: process.env.APIGW_ENDPOINT,
    });

    if (connectionData && connectionData.Items) {
        const data = JSON.stringify(parsedBody);
        const postCalls = connectionData.Items.map(async ({ connectionId }) => {
            if (connectionIdSender !== connectionId) {
                try {
                    await apiGW.postToConnection({ ConnectionId: connectionId, Data: data }).promise();
                } catch (e) {
                    if ((e as any).statusCode === 410) {
                        console.log(`Found stale connection, deleting ${connectionId}`);
                        await ddb
                            .delete({ TableName: process.env.TABLE_NAME!, Key: { connectionIdDB: connectionId } })
                            .promise();
                    } else {
                        throw e;
                    }
                }
            }
        });

        try {
            await Promise.all(postCalls);
        } catch (e) {
            return { statusCode: 500, body: (e as any).stack };
        }
    }

    return { statusCode: 200, body: 'Data sent.' };
}
