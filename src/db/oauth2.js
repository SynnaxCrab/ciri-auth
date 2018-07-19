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
import { createToken } from './oauth_token'

/**
 * getClient oauth server model interface
 *
 * @param {*} clientId
 * @param {*} clientSecret
 * @returns {Object}
 */

export const getClient = async (clientId, clientSecret) => {
  console.log('getClient')
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
  console.log('saveAuthorizationCode')
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

export const saveToken = async (token, client, user) => {
  console.log('saveToken')
  const values = {
    access_token: token.accessToken,
    expires_at: token.accessTokenExpiresAt,
    scope: token.scope,
    refresh_token: token.refreshToken,
    refresh_token_expires_at: token.refreshTokenExpiresAt,
    oauth_client_id: client.id,
    user_id: user.id,
  }

  const createdToken = await createToken(values)

  return {
    accessToken: createdToken.access_token,
    accessTokenExpiresAt: createdToken.expires_at,
    refreshToken: createdToken.refresh_token,
    refreshTokenExpiresAt: createdToken.expires_at,
    scope: createdToken.scope,
    client: { id: createdToken.client_id },
    user: { id: createdToken.user_id },
  }
}
