<!-- SPDX-License-Identifier: Apache-2.0 -->
# Login with Security BC

## Authentication with Mojaloop Security BC

The user will be authenticated with the Security BC. The user will be required to enter their email address and password. The Security BC will validate the user against the security bounded context and then return a token to the user. This token will be used to authenticate the user for all future requests to the config service back end, until such time as it expires.

```mermaid
sequenceDiagram
title Sequence Diagram: Authentication with Security BC
  participant Client as Browser
  box Purple Config Service BC
    participant Auth_Service
    participant Environment
    participant Local_Storage
    participant Router
  end
  box Blue Security BC
    participant Security_BC_AuthN
  end

  Client->>Auth_Service: login(data)
  activate Auth_Service
  Auth_Service->>Environment: Get API URL and Client ID
  Environment-->>Auth_Service: NEXT_PUBLIC_SECURITY_BC_URL, NEXT_PUBLIC_SECURITY_BC_CLIENT_ID
  Auth_Service->>Security_BC_AuthN: POST /token (data, URL, client_id, grant_type: "password")
  activate Security_BC_AuthN
  Security_BC_AuthN-->>Auth_Service: {access_token} / {error}
  deactivate Security_BC_AuthN
  alt success
      Auth_Service->>Local_Storage: setItem("token", access_token)
      Local_Storage-->>Auth_Service: Success
      Auth_Service->>Router: push(params.get("next") || "/")
      Router-->>Auth_Service: Navigation success
      Auth_Service-->>Client: {status: 200, message: ""}
  else error
      Auth_Service-->>Client: {status: error_status, message: error_message}
  end
  deactivate Auth_Service
```
