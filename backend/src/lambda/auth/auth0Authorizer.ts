import { CustomAuthorizerEvent, CustomAuthorizerResult, CustomAuthorizerHandler } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios, { AxiosRequestConfig } from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { JwtKeys } from '../../auth/JwtKeys'
import { JwtKey } from '../../auth/JwtKey'

const logger = createLogger('auth')

let cachedJwks = null

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = `https://dev-ovoo9b2e.auth0.com/.well-known/jwks.json`

export const handler: CustomAuthorizerHandler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  try {
    const token = getToken(authHeader)
    const jwt: Jwt = decode(token, { complete: true }) as Jwt

    // TODO: Implement token verification
    // You should implement it similarly to how it was implemented for the exercise for the lesson 5
    // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

    await getJwtSecret()

    const key = await getJWKSSigningKey(jwt.header.kid)
    const actualKey = key.publicKey || key.rsaPublicKey

    return verify(token, actualKey, { algorithms: ['RS256'] }) as JwtPayload
  } catch (error) {
    throw new Error('401 UnAuthorized')
  }
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function getJwtSecret() {
  try {
    if (!cachedJwks) {
      const params: AxiosRequestConfig = {
        url: jwksUrl,
        method: 'get',
        responseType: 'json'
      }
      const response = await Axios(params)

      cachedJwks = response.data.keys as JwtKeys[]
    }
  } catch (error) {
    throw new Error("Can't retrieve Jwt Secret")
  }
}

function certToPEM(cert) {
  let pem = cert.match(/.{1,64}/g).join('\n')
  pem = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
  return pem
}

async function getJWKSSigningKeys(): Promise<JwtKey[]> {
  return cachedJwks
    .filter(
      key =>
        key.use === 'sig' && // JWK property `use` determines the JWK is for signing
        key.kty === 'RSA' && // We are only supporting RSA (RS256)
        key.kid && // The `kid` must be present to be useful for later
        ((key.x5c && key.x5c.length) || (key.n && key.e)) // Has useful public keys
    )
    .map(key => ({
      kid: key.kid,
      nbf: key.nbf,
      publicKey: certToPEM(key.x5c[0])
    }))
}

async function getJWKSSigningKey(kid): Promise<JwtKey> {
  const keys = await getJWKSSigningKeys()
  return keys.find(key => key.kid === kid)
}
