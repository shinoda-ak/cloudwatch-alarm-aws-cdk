import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

const WAIT_TIME_MSEC = 10 * 1000

async function  wait (msec:number) {
  return new Promise(resolve => setTimeout(resolve, msec))
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log(event)

  await wait(WAIT_TIME_MSEC)

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({status: 'OK'})
  }
}
