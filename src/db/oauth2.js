export const getClient = (clientId, clientSecret) => {
  console.log(clientId)
  return {
    grants: ['authorization_code'],
    redirectUris: ['127.0.0.1:3000'],
  }
}

export const saveAuthorizationCode = (code, client, user) => {
  console.log(code)
  return code
}

export const getAccessToken = accessToken => {
  console.log(accessToken)
  return 1
}
