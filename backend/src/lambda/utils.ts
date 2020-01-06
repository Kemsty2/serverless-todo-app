import { APIGatewayProxyEvent } from 'aws-lambda'
import { parseUserId } from '../auth/utils'
import { getTodoById } from '../businessLogic/todos'

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}

export function getJwtToken(event: APIGatewayProxyEvent) {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  return split[1]
}

export const todoExists = async (jwtToken: string, todoId: string) => {
  const result = await getTodoById(jwtToken, todoId)

  return !!result
}
