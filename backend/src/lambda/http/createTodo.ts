import 'source-map-support/register'

import * as middy from 'middy'
import {cors} from 'middy/middlewares'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'
import { getJwtToken } from '../utils'
import * as warmer from 'lambda-warmer'

import { createLogger } from '../../utils/logger'

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

  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  // TODO: Implement creating a new TODO item
  const jwtToken = getJwtToken(event)
  logger.info('Getting Jwt Token', jwtToken)

  const newItem = await createTodo(newTodo, jwtToken)
  logger.info('Todo Item was Created', newItem)
  return {
    statusCode: 201,    
    body: JSON.stringify({
      item: newItem
    })
  }
})

handler.use(cors({
  credentials: true
}))
