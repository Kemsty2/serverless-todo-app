// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'l0u8a78gik'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-ovoo9b2e.auth0.com',            // Auth0 domain
  clientId: 'YFV57d5CMI4ldB8S6IIyivx7Y9UFPX1b',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
