import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { getAllTodos } from '../../businessLogic/todos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getJwtToken } from '../utils'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  const jwtToken = getJwtToken(event)
  
  const items = await getAllTodos(jwtToken);

  return {
    statusCode: 200,
    body: JSON.stringify({items})
  }

})

handler.use(cors({
  credentials: true
}))


