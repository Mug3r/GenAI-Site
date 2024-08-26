const AWS = require('aws-sdk');

exports.handler = async (event) => {
    // Extract genres and actors from the query parameters
    const genres = event.queryStringParameters.genres;
    const actors = event.queryStringParameters.actors;
    
    // Initialize the Bedrock client
    const bedrock = new AWS.Bedrock();
    
    // Define the input for the Bedrock model
    const inputData = {
        genres: genres,
        actors: actors
    };
    
    try {
        // Call the Bedrock model with the input data
        const response = await bedrock.invokeModel({
            modelId: 'your-model-id',
            contentType: 'application/json',
            body: JSON.stringify(inputData)
        }).promise();
        
        // Parse the response body
        const result = JSON.parse(response.body);
        
        // Return the result as JSON
        return {
            statusCode: 200,
            body: JSON.stringify(result),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
        
    } catch (error) {
        console.error('Error invoking Bedrock model:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error invoking Bedrock model' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }
};
