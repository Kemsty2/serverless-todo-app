import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { getAllTodos } from '../../businessLogic/todos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getJwtToken } from '../utils'
import * as warmer from 'lambda-warmer'

import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodo')

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

  // TODO: Get all TODO items for a current user
  const jwtToken = getJwtToken(event)
  logger.info('Get jwt Token', jwtToken)
  
  const items = await getAllTodos(jwtToken);
  logger.info('Get all the todo of the current user', items)
  
  return {
    statusCode: 200,
    body: JSON.stringify({items})
  }

})

handler.use(cors({
  credentials: true
}))


