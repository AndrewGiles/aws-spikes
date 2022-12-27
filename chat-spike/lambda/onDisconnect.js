const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    // console.log(event)

    const {
        requestContext: {
            connectionId,
        },
    } = event;

    const gsi1pk = `CONNECTION#${connectionId}`;
    const gsi1sk = 'connection';

    // remove connectionId to ddb using secondary index
    try {
        const result = await ddb.query({
            TableName: "ChatApp",
            IndexName: 'gsi1pk-gsi1sk-index',
            KeyConditionExpression: 'gsi1pk = :pk and gsi1sk = :sk',
            ExpressionAttributeValues: {
                ':pk': gsi1pk,
                ':sk': gsi1sk
            },
        }).promise();

        if (!result) return {
            status: 404,
            body: JSON.stringify({ error: `error finding connection: ${connectionId}` })
        }

        const connection = result.Items[0];

        if (!connection) return {
            status: 404,
            body: JSON.stringify({ error: `Could not find connection: ${connectionId}` })
        }

        try {
            await ddb.delete({
                TableName: "ChatApp",
                Key: {
                    pk: connection.pk,
                    sk: connection.sk,
                },
            }).promise();

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'successfully disconnected from room' }),
            }
        } catch (error) {
            console.error(error, event);
            return {
                status: 500,
                body: JSON.stringify({ error: `Internal server error. Please try again.` })
            }
        }

    } catch (error) {
        console.error(error, event);
        return {
            status: 500,
            body: JSON.stringify({ error: `Internal server error. Please try again.` })
        }
    }
}
