# ciri-auth

[![Build Status](https://travis-ci.org/winfield/ciri-auth.svg?branch=master)](https://travis-ci.org/winfield/ciri-auth)
[![Greenkeeper badge](https://badges.greenkeeper.io/winfield/ciri-auth.svg)](https://greenkeeper.io/)

The Auth Micro Service for Ciri

## How it works

This micro service follows OAuth2 authorization_code flow, with some customization.

Traditionally, when user was redirect to auth server's authorize end point, the auth server would ask user's credentials(username, password) to authorize the user. This service uses a similiar stratagey, but instead of using username/password, it uses user's third party identity to authorize the user(Facebook, Github, Twitter etc). It will support username/password authorization later, but for now only Github is supported.

So it works like this:

1.  User is redirected to this service's /authorize end point with params provide=xxx
2.  User is redirected to the provider's oauth system to get an identity
3.  After successfully getting the identity, the service redirect user to it's redirect uri with an authorization code
4.  Then the service at the redirect uri uses the authorization code to exchange an access token
