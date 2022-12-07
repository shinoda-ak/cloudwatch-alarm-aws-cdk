import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // try {
    throw new Error('An unexpected error ocurred')
  // } catch (err) {
  //   return {
  //     statusCode: 400,
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Access-Control-Allow-Origin': '*'
  //     },
  //     body: JSON.stringify({
  //       status: 'Error',
  //       error: err
  //     })
  //   }
  // }
}
