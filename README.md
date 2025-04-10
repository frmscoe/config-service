<!-- SPDX-License-Identifier: Apache-2.0 -->
# TMS Configuration Service Documentation [Draft]

## Introduction  

This is the Tazama configuration service. The Configuration Service is a tool to allow a non developer to modify the various artefacts within a Tazama deployment. We provide more information on the target implementers in the [Target Customers Document](docs/01-product/01_target_customers.md).

It is assumed that you have already reviewed the main Tazama documentation. Once you are ready to deploy, please ensure you follow the machine setup instructions at [Section 3.2.1 of contribution Guide](https://github.com/tazama-lf/docs/blob/dev/Guides/dev-set-up-environment.md).

The sequence of a standalone deployment of the configuration service is as follows:

1. [Tazama Stack](https://github.com/tazama-lf/Full-Stack-Docker-Tazama) - if you wish to streamline your service you need the following shared components:
   1. Authentication Service
   1. KeyCloak
   1. ArangoDB
   1. NATS
   1. ValKey
   1. LumberJack
   1. Event-sidecar
   1. Elasticsearch
   1. Kibana
1. Config Service Backend Deployment
   1. **Auth Lib Dependency**
1. Config Service Frontend Deployment

## Tazama Auth Service and Keycloak Deployment

***Keycloak*** is deployed alongside the **Tazama Authentication Service**, which acts as an abstraction layer for Keycloak. The authentication service integrates Keycloak into the **Configuration Service Backend**, ensuring secure and seamless authentication across the platform, but with the flexibility to replace Keycloak with another service if desired.

### Clone Full Stack Tazama

Do a git clone of the full stack tazama `git clone https://github.com/tazama-lf/Full-Stack-Docker-Tazama`

If you have setup your Token, you can jump to [Docker Compose](#docker-compose)

### Set GH Token (if not done already)

you have to set your git token so as to be able to deploy the auth service correctly

- macOS & Linux (Ubuntu/Debian)

For Bash (bash shell users):

```sh
echo 'export GH_TOKEN="your_personal_access_token"' >> ~/.bashrc
source ~/.bashrc
```

For Zsh (zsh shell users, default for macOS):

```sh
echo 'export GH_TOKEN="your_personal_access_token"' >> ~/.zshrc
source ~/.zshrc
```

For Fish (fish shell users):

```sh
set -Ux GH_TOKEN "your_personal_access_token"
```

- Windows

Option 1: Using Command Prompt

Run this in cmd:

```sh
setx GH_TOKEN "your_personal_access_token"
```

Option 2: Using PowerShell

Run:

```sh
[System.Environment]::SetEnvironmentVariable("GH_TOKEN", "your_personal_access_token", "User")
```

Option 3: Through the GUI

- Press Win + R, type sysdm.cpl, and hit Enter.
- Go to the Advanced tab and click Environment Variables.
- Under User variables, click New.
- Set Variable name as GH_TOKEN and Variable value as your_personal_access_token.
- Click OK, then restart your terminal or system.

To confirm that the variable is set correctly:

- macOS & Linux:

```sh
echo $GH_TOKEN
```

Windows (cmd):

```sh
echo %GH_TOKEN%
```

Windows (PowerShell):

```sh
$env:GH_TOKEN
```

### Docker Compose

Make sure you have docker properly setup.

cd into `Full-Stack-Docker-Tazama`

> WARNING :exclamation: Currently the Tazama auth service has a dependency on Arango, it might not deploy if you do not remove the dependency [PR raised to address](https://github.com/tazama-lf/Full-Stack-Docker-Tazama/pull/111)

remove `- arango`

> WARNING :exclamation: Currently the Tazama infrastructure service does not expose the Arango ports correctly [PR raised to address](https://github.com/tazama-lf/Full-Stack-Docker-Tazama/pull/111)

add ports `18529:8529`

then run this command in the terminal to deploy auth service and keycloak, and the necessary infrastructure

```sh
docker compose -f docker-compose.infrastructure.yaml -p tazama up -d
docker compose -f docker-compose.auth.yaml -p tazama up -d
```

### Access Keycloak Admin Console

- Open [http://localhost:8080/admin](http://localhost:8080/admin)
- Login using: **Username: `admin` | Password: `password`**

#### Confirm The Auth Service is Up  

We use postman to check the service, with the following request

We will check we can Get a token using a New Postman request

- Type: POST
- URL: http://localhost:3020/v1/auth/login

With the following in the body (raw)
```bash
{
  "username": "tazama-user",
  "password": "password"
}
```

If all is configured with Tazama - you should receive a token.

## Keycloak Setup for Config Service Users, Roles and Privileges

Login to the Keycloak Portal [http://localhost:8080/](http://localhost:8080/) - user name `admin` and password `password`

- A realm called `tazama` was already created during the deployment for the Tazama service

**WARNING: MAKE SURE YOU SELECT THE TAZAMA REALM - IT MAY HAVE DEFAULTED TO MASTER**

### Create Groups

You should see **tazama_admin** and **tazama_tms**

- Go to Groups. Click on ***create group***
- Enter the following one at a time:
  - `config_svc_admin`
  - `config_svc_editor`
  - `config_svc_approver`
  - `config_svc_viewer`

### Create Realm Roles

You should see GET_V1_EVENT_FLOW_CONTROL_ACCOUNT and more

- Go to ***Realm roles***
- Click on ***Create role***
- Create the following roles one at a time:
  - SECURITY_APPROVE_NETWORK_MAP
  - SECURITY_CREATE_NETWORK_MAP
  - SECURITY_CREATE_RULE
  - SECURITY_CREATE_RULE_CONFIG
  - SECURITY_CREATE_TYPOLOGY
  - SECURITY_CREATE_TYPOLOGY_RULE_CONFIG
  - SECURITY_DISABLE_RULE
  - SECURITY_DISABLE_RULE_CONFIG
  - SECURITY_DELETE_NETWORK_MAP
  - SECURITY_DELETE_RULE
  - SECURITY_DELETE_RULE_CONFIG
  - SECURITY_DELETE_TYPOLOGY
  - SECURITY_DISABLE_NETWORK_MAP
  - SECURITY_DISABLE_TYPOLOGY
  - SECURITY_EXPORT_NETWORK_MAP
  - SECURITY_GET_NETWORK_MAP
  - SECURITY_GET_RULE
  - SECURITY_GET_RULES
  - SECURITY_GET_RULE_CONFIG
  - SECURITY_GET_RULE_CONFIGS
  - SECURITY_GET_RULE_RULE_CONFIG
  - SECURITY_GET_TYPOLOGIES
  - SECURITY_GET_TYPOLOGY
  - SECURITY_GET_TYPOLOGY_RULE_CONFIG
  - SECURITY_GET_TYPOLOGY_RULE_CONFIGS
  - SECURITY_IMPORT_NETWORK_MAP
  - SECURITY_UPDATE_NETWORK_MAP
  - SECURITY_UPDATE_RULE
  - SECURITY_UPDATE_RULE_CONFIG
  - SECURITY_UPDATE_TYPOLOGY
  - SECURITY_UPDATE_TYPOLOGY_RULE_CONFIG

### Assign Realm Roles to Groups  

We have created 31 realm roles.

#### config_svc_admin

- Go to `Groups`
- Click on `config_svc_admin`
- Click on `Role mapping`
- Click on `Assign role`
- Select the following roles. all 31 of them (expand the modal so you can see all of the roles in needed):
  - SECURITY_APPROVE_NETWORK_MAP
  - SECURITY_CREATE_NETWORK_MAP
  - SECURITY_CREATE_RULE
  - SECURITY_CREATE_RULE_CONFIG
  - SECURITY_CREATE_TYPOLOGY
  - SECURITY_CREATE_TYPOLOGY_RULE_CONFIG
  - SECURITY_DISABLE_RULE
  - SECURITY_DISABLE_RULE_CONFIG
  - SECURITY_DELETE_NETWORK_MAP
  - SECURITY_DELETE_RULE
  - SECURITY_DELETE_RULE_CONFIG
  - SECURITY_DELETE_TYPOLOGY
  - SECURITY_DISABLE_NETWORK_MAP
  - SECURITY_DISABLE_TYPOLOGY
  - SECURITY_EXPORT_NETWORK_MAP
  - SECURITY_GET_NETWORK_MAP
  - SECURITY_GET_RULE
  - SECURITY_GET_RULES
  - SECURITY_GET_RULE_CONFIG
  - SECURITY_GET_RULE_CONFIGS
  - SECURITY_GET_RULE_RULE_CONFIG
  - SECURITY_GET_TYPOLOGIES
  - SECURITY_GET_TYPOLOGY
  - SECURITY_GET_TYPOLOGY_RULE_CONFIG
  - SECURITY_GET_TYPOLOGY_RULE_CONFIGS
  - SECURITY_IMPORT_NETWORK_MAP
  - SECURITY_UPDATE_NETWORK_MAP
  - SECURITY_UPDATE_RULE
  - SECURITY_UPDATE_RULE_CONFIG
  - SECURITY_UPDATE_TYPOLOGY
  - SECURITY_UPDATE_TYPOLOGY_RULE_CONFIG

#### config_svc_approver

- Click on `config_svc_approver`
- Click on `Role mapping`
- Click on `Assign role`
- Select the below roles:
  - SECURITY_CREATE_RULE  
  - SECURITY_CREATE_RULE_CONFIG  
  - SECURITY_CREATE_TYPOLOGY  
  - SECURITY_CREATE_TYPOLOGY_RULE_CONFIG  
  - SECURITY_GET_RULE
  - SECURITY_GET_RULE_CONFIG
  - SECURITY_GET_RULE_CONFIGS
  - SECURITY_GET_RULE_RULE_CONFIG
  - SECURITY_GET_RULES
  - SECURITY_GET_TYPOLOGIES
  - SECURITY_GET_TYPOLOGY
  - SECURITY_GET_TYPOLOGY_RULE_CONFIGS
  - SECURITY_GET_TYPOLOGY_RULE_CONFIG
  - SECURITY_UPDATE_RULE  
  - SECURITY_UPDATE_RULE_CONFIG  
  - SECURITY_UPDATE_TYPOLOGY  
  - SECURITY_UPDATE_TYPOLOGY_RULE_CONFIG

#### config_svc_editor

- Click on `config_svc_editor`
- Click on `Role mapping`
- Click on `Assign role`
- Select the below roles:
  - SECURITY_CREATE_RULE  
  - SECURITY_CREATE_RULE_CONFIG  
  - SECURITY_CREATE_TYPOLOGY  
  - SECURITY_CREATE_TYPOLOGY_RULE_CONFIG  
  - SECURITY_GET_RULE
  - SECURITY_GET_RULE_CONFIG
  - SECURITY_GET_RULE_CONFIGS
  - SECURITY_GET_RULE_RULE_CONFIG
  - SECURITY_GET_RULES
  - SECURITY_GET_TYPOLOGIES
  - SECURITY_GET_TYPOLOGY
  - SECURITY_GET_TYPOLOGY_RULE_CONFIG
  - SECURITY_GET_TYPOLOGY_RULE_CONFIGS
  - SECURITY_UPDATE_RULE  
  - SECURITY_UPDATE_RULE_CONFIG  
  - SECURITY_UPDATE_TYPOLOGY  
  - SECURITY_UPDATE_TYPOLOGY_RULE_CONFIG

#### config_svc_viewer

- Click on `config_svc_viewer`
- Click on `Role mapping`
- Click on `Assign role`
- Select the below roles:
  - SECURITY_GET_RULE
  - SECURITY_GET_RULE_CONFIG
  - SECURITY_GET_RULE_CONFIGS
  - SECURITY_GET_RULE_RULE_CONFIG
  - SECURITY_GET_RULES
  - SECURITY_GET_TYPOLOGIES
  - SECURITY_GET_TYPOLOGY
  - SECURITY_GET_TYPOLOGY_RULE_CONFIG
  - SECURITY_GET_TYPOLOGY_RULE_CONFIGS

### Create User

We need to create test users so we can evaluate the service

#### User Details

- Go to `user`
- Click on `add user`
- Check the `Email Verified`
- Fill out the `Username` `Email` `First Name` `Last Name` **NOTE** - User name must be the same as email for now
- Click on `Join group` then select the group for the user. Click `join`
- Then click on `create`

#### User Password

- Go to `user`
- Click on the user
- Click on `Credentials`
- Then create a password. Remember to uncheck `Temporary` if it is checked

#### Assign Groups to Existing User

You can assign groups or change the groups of an exitsing user
- Go to `user`
- Click on the specific user eg `tazama-user`
- Click on `Groups`
- Click on `Join Group`
- Select the required group
- Then click on `Join`

## Config Service Packages

Clone the config service frontend and backend using this command `git clone --branch dev https://github.com/frmscoe/config-service.git`

or `git clone --branch dev git@github.com:frmscoe/config-service.git` if you have setup SSH

## Config Service Backend Deployment

Navigate to `config-service/packages/config-svc-be`

### Install All The Required Dependencies

```sh
nvm use
npm install
```

### Auth Lib Dependency - NPM Package Installation

Ensure that a `.npmrc` file exists at the same location with the `package.json` file of `config-svc-be`.
It should contain the below content:

```sh
@tazama-lf:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GH_TOKEN}
```

Then run the below command to install `auth-lib`

```sh
npm install @tazama-lf/auth-lib
```

### Set Environment Variables

There is a `.env` file created at the root of the folder and setup the environment variables below.

```t
# Arango Database Connection.
DATABASE_HOST=http://localhost:18529/ # ArangoDB URL
DATABASE_NAME=config-svc-db # The main database
SYSTEM_DATABASE_NAME=_system # System database (pre-installed)
DATABASE_USERNAME=root # Default username
DATABASE_PASSWORD=password # Default password
DATABASE_NAME_TEST=config-svc-db-test # Test database

# config-svc-be application port
PORT=3007
```

### Set Auth Lib Environment Variable

Add the following to the `.env` you created above

```t
# Auth Lib
AUTH_URL=http://localhost:8080 
KEYCLOAK_REALM=tazama
CLIENT_ID=auth-lib-client 
CLIENT_SECRET=auth-lib-client-test-secret 
CERT_PATH_PRIVATE=/absolute/path/to/test-private-key.pem 
CERT_PATH_PUBLIC=/absolute/path/to/test-public-key.pem 
```

#### Private Key (private-key.pem) - CERT_PATH_PRIVATE:

A test-private-key.pem has been provided for you. You should find it in `config-service/packages/test-private-key.pem`

#### Public Key (public-key.pem) - CERT_PATH_PUBLIC:

A test-public-key.pem has been provided for you. You should find it in `config-service/packages/test-private-key.pem`

#### Store Paths in the `.env` File

Now that you have your keys, store the file paths in `config-svc-be/.env`:

```t
CERT_PATH_PRIVATE=/absolute/path/to/config-service/packages/test-private-key.pem
CERT_PATH_PUBLIC=/absolute/path/to/config-service/packages/test-private-key.pem
```

- Replace `/absolute/path/to/` with the actual location where you saved the files.

#### Troubleshooting

- If `auth-lib` throws an error like `"Missing or Corrupted Private Key"`, ensure that:
  - The `.env` file is loaded before `auth-lib` is initialized.
  - The private key file exists and has the correct path.
- If permissions issues arise, change file permissions:
  - chmod 600 test-private-key.pem test-public-key.pem

### Start The Server

```sh
npm run start
```

***Check Server***
open http://localhost:3007

***API Endpoints***
swagger http://localhost:3007/swagger

NB: for the environment variables, you can copy the contents in `.env.sample` file into `.env` file and then modify them to suit your setup.  

## Config Service Frontend Deployment

Navigate to `config-service/packages/config-svc-fe`

### NPM Package Installation

```sh
nvm use
npm install
```

### Set Environment Variables

create a `.env` and paste the following environment variables:

```t
PORT=4000 # this specifies the port the frontend is running

NEXT_PUBLIC_CONFIG_SVC_BE_URL=http://localhost:3007 # this is the config_svc_be URL
NEXT_PUBLIC_SECURITY_BC_CLIENT_ID=auth-lib-client # this is the keycloak client ID
NEXT_PUBLIC_SECURITY_BC_SECRET=auth-lib-client-test-secret # this is the keycloak client secret
```

> Warning :exclamation: You must set your IP instead of local host, if you are running a remote machine.

### Start The Server
```sh
npm run dev
```

***Check Server***
http://localhost:4000

NB: for the environment variables, you can copy the contents in `.env.sample` file into `.env` file and then modify them to suit your setup.

## Automated Testing

Now the service is deployed, we can run the following automated tests 

***Frontend - Login Page Test***
1. EmailInputForm Test
2. PasswordInputForm Test
3. LoginProcess Test
4. ImportRuleTests

The automated test was built using Jest Test Framework. Use the below command to run the test:

```sh
npm run test
```

To generate a coverage report for the test use this command (NB: this is optional):

```sh
npx jest --coverage
```

