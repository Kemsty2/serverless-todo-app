import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { deleteTodo } from '../../businessLogic/todos'
import { cors } from 'middy/middlewares'
import * as middy from 'middy'
import { getJwtToken, todoExists } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const jwtToken = getJwtToken(event)
  
  const validTodoid = await todoExists(jwtToken, todoId)

  if(!validTodoid){
    logger.info('Todo Item was not found', todoId)
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Todo Item not Found'
      })
    }
  }

  // TODO: Remove a TODO item by id  
  await deleteTodo(todoId, jwtToken)
  return {
    statusCode: 200,
    body: ''
  }
})

handler.use(cors({
  credentials: true
}))
