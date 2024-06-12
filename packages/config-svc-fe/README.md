# Configuration Service Front End

## Setup

### Windows users

- You must have **Ubuntu 22.04.2** running locally on WSL2 (Windows Subsystem for Linux).
- Please check the `./packages/config-svc-fe/.nvmrc` file for the version of node to use with this project.

## Installation / setup

### Setting up the local site

1. Open a new terminal window and navigate to the `config-svc-fe` folder

```bash
cd packages/config-svc-fe
```

2. Check the version of node in the `./packages/config-svc-fe/.nvmrc`
3. Run `nvm use` or `nvm use {.nvmrc node version}` to change to the correct version
4. Run `npm install` to install all dependencies.
5. Copy the `.env.sample` file and save as your `.env` file:

```bash
cp .env.sample .env.local
```

#### Env variables

1. **PORT**

   Port for which the frontend client will be running on. Default is 4000

2. **NEXT_PUBLIC_CONFIG_SVC_BE_URL**

   use `http://localhost:3007`. This is the url of the config-svc backend which runs on default port of 3007.

3. **NEXT_PUBLIC_SECURITY_BC_URL**

   use `http://localhost:3201`. This is the url for mojaloop/security-bc-authentication-svc:0.5.4

4. **NEXT_PUBLIC_SECURITY_BC_CLIENT_ID**

   This is the client id for one of the builtin IAM applications. This can be found under the mojaloop admin ui. **_security-bc-ui_** is the default client_id

### Generate local certificates for https:

1. Run the following:

```shell
mkdir certificates
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout certificates/localhost.key -out certificates/localhost.crt
```

2. You will be presented with the following options, hit **enter** for all of them:

```shell
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:
State or Province Name (full name) [Some-State]:
Locality Name (eg, city) []:
Organization Name (eg, company) [Internet Widgits Pty Ltd]:
Organizational Unit Name (eg, section) []:
Common Name (e.g. server FQDN or YOUR name) []:
Email Address []:
```

### Give full read/write access to the new directories and files

```shell
sudo chmod 777 .env.local
sudo chmod -R 777 ./certificates
```

## Deploy dependencies

```bash
npm install
```

## Running the project

1. Run `npm run dev` to fire up the development server.
2. The site should now be running at [https://localhost:4000](https://localhost:4000).

## Create User Account and privileges

1. Follow these [steps](https://github.com/lextego/config-svc/blob/main/docs/02-deployment/90-mojaloop-platform-shared-tools-deployment.md#mojaloop-vnext-admin-ui) to setup the mojaloop admin ui

2. Once done access the UI on http://localhost:4200

3. Login using the default user accounts below

```text
Please note the Default users:

1.
username: user
password: superPass

2.
username: admin
password: superMegaPass
```

4. Go to **SETTINGS** sections and click **Security** and select **Builtin IAM - Users**

5. On the **Builtin IAM - Users** Page click on the **Create User** button in the top right corner

6. On the create user page enter details for the user including the fields below and click create

   - User Type (default Hub User)
   - Email
   - Full Name
   - Password
   - Password confirmation

7. Once the user is created you will be redirected to the users page with url in this format http://localhost:4200/security/builtin_iam/users/{user_email}.

8. On the users detail page click **Add Roles** button to open a modal to give the user some roles.

9. Select admin role in the dropdown and click Add roles button to save these roles.

   **Note:** Currently, we are temporarily using the admin role. We will create specific roles for the configuration service once they are defined.

10. On the same users page, look for the Associated Roles Section which has a table with columns:

    - Name
    - Description
    - Actions

11. Under the **Name** section. Click on the Admin role to go to the role management page to configure Some privileges for this user.

12. Once on the roles management page. Select the **Add Privileges** Tab to go and manage some privileges for the user.

13. Select the application to assign privileges in the **Application** drop down.

14. In the List. Check all the privileges you want to assign the user and click the **Add Selected privileges(s) to Role** button. This privileges will be assigned to the user.

### Troubleshooting

**Error**: If you get the following error then port 3001 is already in use.

```shell
⨯ uncaughtException: Error: listen EADDRINUSE: address already in use :::3001
    at Server.setupListenHandle [as _listen2] (node:net:1872:16)
    at listenInCluster (node:net:1920:12)
    at Server.listen (node:net:2008:7)
    at Function.listen ({your-project-root}/node_modules/express/lib/application.js:635:24)
    at {your-project-root}/server.js:18:10 {
  code: 'EADDRINUSE',
  errno: -98,
  syscall: 'listen',
  address: '::',
  port: 3001
}
```

**Solution**: Edit your local `.env` file and change the PORT number to something not in use on your system.

**Error**: If you get a CORS during login

**Solution**: You need to install the Chrome Extension for CORS

[Chrome](https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf)

How to use [https://www.youtube.com/watch?v=KruSUqLdxQA]

[Firefox](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/)

How to use [https://github.com/spenibus/cors-everywhere-firefox-addon?tab=readme-ov-file#usage]

Please read the install and activation steps for each extensions provided in the store

## Checking / Testing

- **Lint the code**: `npm run lint`. This command uses ESLint to enforce code quality and formatting.
- **Run the tests**: `npm test`. This will run Jest tests for all components.

## Building / Deployment

- **Build for production**: `npm run build`. This command compiles the TypeScript files and creates a production-ready build.
