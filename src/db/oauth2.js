export const getClient = (clientId, clientSecret) => {
  console.log('getClient')
  return {
    grants: ['authorization_code'],
    redirectUris: ['127.0.0.1:3000'],
  }
}

export const saveAuthorizationCode = (code, client, user) => {
  console.log('saveAuthorizationCode')
  return code
}

export const getAccessToken = accessToken => {
  console.log('getAccessToken')
  return 1
}

export const getAuthorizationCode = code => {
  console.log('getAuthorizationCode')
  return {
    code,
    client: {},
    user: {},
    expiresAt: new Date(),
  }
}

export const revokeAuthorizationCode = code => {
  console.log('revokeAuthorizationCode')
  return true
}

export const saveToken = (token, client, user) => {
  console.log('saveToken')
  return {
    accessToken: token,
    client,
    user,
  }
}
