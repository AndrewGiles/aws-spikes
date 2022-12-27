const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    // console.log(event);

    const {
        requestContext: {
            domainName,
            stage,
        } = {},
        body = '{}',
    } = event;

    const {
        roomId,
        msg,
    } = JSON.parse(body);

    const endpoint = `${domainName}/${stage}`;

    try {
        await sendToAll({ endpoint, roomId, msg })
    } catch (err) {
        console.error(err);
        return {
            statusCode: 400,
            body: JSON.stringify('Error sending message'),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify('Message Sent.'),
    };
};


async function sendToAll({ endpoint, roomId, msg }) {
    // get connections from db
    const pk = `ROOM#${roomId}`;

    try {
        const result = await ddb.query({
            TableName: "ChatApp",
            KeyConditionExpression: 'pk = :pk and begins_with(sk, :connection)',
            ExpressionAttributeValues: {
                ':pk': pk,
                ':connection': 'CONNECTION#',
            },
        }).promise();

        const callbackArray = result.Items.map(({ connectionId }) => sendToSingleConnection({ roomId, endpoint, connectionId, msg }));
        return Promise.all(callbackArray);
    }
    catch (err) {
        console.error(err)
    }
}

async function sendToSingleConnection({ roomId, endpoint, msg, connectionId }) {

    const api = new AWS.ApiGatewayManagementApi({
        apiVersion: "2018-11-29",
        endpoint,
    });

    try {
        await api.postToConnection({
            ConnectionId: connectionId,
            Data: Buffer.from(JSON.stringify({ msg })),
        }).promise()
    }
    catch (err) {

        // Deletes any stale connections
        if (err.statusCode === 410) {
            const pk = `ROOM#${roomId}`;
            const sk = `CONNECTION#${connectionId}`;

            ddb.deleteItem({
                TableName: 'ChatApp',
                Key: {
                    pk,
                    sk,
                },
            });
        } else {
            console.error(err)
        }
    }

    return;
}
