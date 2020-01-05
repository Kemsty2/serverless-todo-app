import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { deleteTodo } from '../../businessLogic/todos'
import { cors } from 'middy/middlewares'
import * as middy from 'middy'
import { getJwtToken } from '../utils'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // TODO: Remove a TODO item by id
  const jwtToken = getJwtToken(event)
  await deleteTodo(todoId, jwtToken)
  return {
    statusCode: 200,
    body: ''
  }
})

handler.use(cors({
  credentials: true
}))
