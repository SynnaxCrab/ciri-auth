import { Pool } from 'pg'
import { sql } from 'pg-sql'
import { INSERT, UPDATE, WHERE } from 'pg-sql-helpers'
import QUERY from './query'

import { findClient } from './oauth_client'
import {
  findAuthorizationCode,
  createAuthorizationCode,
  deleteAuthorizationCode,
} from './oauth_authorization_code'

/**
 * getClient oauth server model interface
 *
 * @param {*} clientId
 * @param {*} clientSecret
 * @returns {Object}
 */

export const getClient = async (clientId, clientSecret) => {
  const client = await findClient(clientId, clientSecret)

  if (client) {
    return {
      id: client.id,
      redirectUris: client.redirect_uris,
      grants: client.grants,
      accessTokenLifetime: client.access_token_lifetime,
      refreshTokenLifetime: client.refresh_token_lifetime,
    }
  } else {
    return null
  }
}

export const saveAuthorizationCode = async (code, client, user) => {
  const values = {
    code: code.authorizationCode,
    expires_at: code.expiresAt,
    redirect_uri: code.redirectUri,
    scope: code.scope,
    oauth_client_id: client.id,
    user_id: user.id,
  }
  const authorizationCode = await createAuthorizationCode(values)
  // TODO: separate logic into function
  return {
    authorizationCode: authorizationCode.code,
    expiresAt: authorizationCode.expires_at,
    redirectUri: authorizationCode.redirect_uri,
    scope: authorizationCode.scope,
    client: { id: authorizationCode.oauth_client_id },
    user: { id: authorizationCode.user_id },
  }
}

export const getAuthorizationCode = async code => {
  console.log('getAuthorizationCode')
  const authorizationCode = await findAuthorizationCode(code)
  console.log(authorizationCode.redirect_uri)
  // TODO: separate logic into function
  return {
    code: authorizationCode.code,
    expiresAt: authorizationCode.expires_at,
    redirectUri: authorizationCode.redirect_uri,
    scope: authorizationCode.scope,
    client: { id: authorizationCode.oauth_client_id },
    user: { id: authorizationCode.user_id },
  }
}

export const revokeAuthorizationCode = async ({ code }) => {
  console.log('revokeAuthorizationCode')
  return await deleteAuthorizationCode(code)
}

export const saveToken = (token, client, user) => {
  console.log('saveToken')
  return {
    accessToken: token,
    client,
    user,
  }
}

export const getAccessToken = accessToken => {
  console.log('getAccessToken')
  return 1
}
