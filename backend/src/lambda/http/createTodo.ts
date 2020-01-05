import 'source-map-support/register'

import * as middy from 'middy'
import {cors} from 'middy/middlewares'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'
import { getJwtToken } from '../utils'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  // TODO: Implement creating a new TODO item
  const jwtToken = getJwtToken(event)
  
  const newItem = await createTodo(newTodo, jwtToken)

  return {
    statusCode: 201,    
    body: JSON.stringify({
      newItem
    })
  }
})

handler.use(cors({
  credentials: true
}))
