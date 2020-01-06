import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import { updateTodo } from '../../businessLogic/todos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getJwtToken, todoExists } from '../utils'

import { createLogger } from '../../utils/logger'

import * as warmer from 'lambda-warmer'

const logger = createLogger('createTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  if (await warmer(event)) {
    console.log('WarmUp - Lambda is warm!')
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Warm Hello World!'
      })
    }
  }

  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  const jwtToken = getJwtToken(event)
  //  Check if user exist 
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
  

  await updateTodo(updatedTodo, todoId, jwtToken)
  return {
    statusCode: 200,
    body: ''
  }
})

handler.use(cors({
  credentials: true
}))
