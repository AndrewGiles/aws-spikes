const AWS = require('aws-sdk')

const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    // console.log(event)

    const {
        requestContext: {
            connectionId,
        },
        queryStringParameters: {
            roomId,
        }
    } = event;

    const pk = `ROOM#${roomId}`;
    const sk = `CONNECTION#${connectionId}`

    // add the connection to the room
    try {
        await ddb.put({
            TableName: "ChatApp",
            Item: {
                pk,
                sk,
                gsi1pk: sk,
                gsi1sk: 'connection',
                connectionId,
            },
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'successfully connected to the room' }),
        }
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            body: JSON.stringify({ error: `Internal server error. Please try again.` })
        }
    }
}
