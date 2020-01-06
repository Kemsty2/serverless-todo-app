import 'source-map-support/register'

import * as AWS from 'aws-sdk'
import * as AWSXray from 'aws-xray-sdk'

const bucketName = process.env.IMAGE_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { cors } from 'middy/middlewares'
import * as middy from 'middy'
import { getJwtToken, todoExists } from '../utils'
import { createLogger } from '../../utils/logger'

const XAWS = AWSXray.captureAWS(AWS)

const logger = createLogger('generateUploadUrl')

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const jwtToken = getJwtToken(event)
  //  Check if the todo item exist
  const validTodoId = await todoExists(jwtToken, todoId)

  if(!validTodoId){
    logger.info('Todo item was not found', todoId)
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Todo Item was not found'
      })
    }
  }

  const uploadUrl = getUploadUrl(todoId)
  logger.info('Presigned url was generated', uploadUrl)
  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl
    })
  }
})

function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: parseInt(urlExpiration)
  })
}

handler.use(cors({
  credentials: true
}))
