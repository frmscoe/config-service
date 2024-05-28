# Arango Fundamentals

## Learn ArangoDB

You can start learning ArangoDB basics by following LexTego ArangoDB guide:

- [ArangoDB Data Structures]("./arangodb_data_structure.md")

Also you can learn ArangoDB with the following free resources:

- <https://university.arangodb.com/courses/graph-course-for-beginners/>
- <https://university.arangodb.com/>
- <https://www.udemy.com/course/getting-started-with-arangodb/>
- <https://arangodb.com/learn/certification/>

## Install ArangoDB with Docker

According to the [documentation](https://docs.arangodb.com/3.11/operations/installation/docker/) installing ArangoDB with docker is the recommended way of using it in the local machine.

You can choose one of the following:

- [arangodb official Docker images](https://hub.docker.com/_/arangodb) , verified and published by Docker.
- [arangodb/arangodb Docker images](https://hub.docker.com/r/arangodb/arangodb), maintained and directly published by ArangoDB regularly.

## Start an ArangoDB instance

In order to start an ArangoDB instance, run:

```bash
docker run -e ARANGO_ROOT_PASSWORD=1 -p 8529:8529 -d --name arangodb-instance arangodb/arangodb
```

- `-e ARANGO_ROOT_PASSWORD=1:` The -e flag is used to set environment variables inside the container. In this case, ARANGO_ROOT_PASSWORD=1 sets the root password of the ArangoDB instance to 1. It's important to choose a secure password for production environments.

- `-p 8529:8529:` The -p flag maps a port on the host to a port in the container. This command maps port 8529 on the host to port 8529 inside the container, which is the default port that ArangoDB listens on for connections.

- `-d:` This flag runs the container in detached mode, meaning the container runs in the background and does not block the terminal session.

- `--name arangodb-instance:` The --name flag assigns a name to the container, making it easier to manage. In this case, the container is named arangodb-instance.

- `arangodb/arangodb:` This specifies the image to use for the container. arangodb/arangodb is the official ArangoDB image from Docker Hub. Docker will download this image the first time you run the command if it's not already present on your system.

## Interacting with ArangoDB instance

### Interactive Command-line Interface (CLI)

You can use [arangosh](https://docs.arangodb.com/3.11/components/tools/arangodb-shell/), an interactive shell that ships with ArangoDB, and its [JavaScript API](https://docs.arangodb.com/3.11/develop/javascript-api/@arangodb/db-object/), to interact with the server. You can also use it for automating tasks.

In order to interact with the ArangoDB instance with CLI

```bash
docker exec -it arangodb-instance arangosh --server.username root --server.password 1 --server.database _system
```

- `-it:` These flags are combined to allow interactive processes. -i (interactive) keeps STDIN open even if not attached, and -t (tty) allocates a pseudo-TTY, making it possible for you to interact with the shell inside the container.

- `arangodb-instance:` This is the name of the Docker container in which ArangoDB is running. You specified this name when you started the container with the docker run command.

- `arangosh:` This is the command being executed inside the Docker container. arangosh is the ArangoDB shell, which allows you to interact directly with your ArangoDB server using a command-line interface.

- `--server.username root:` This option specifies the username to use when connecting to the ArangoDB server. In this case, you're using the root user.

- `--server.password 1:` This option specifies the password for the user. You set this password to 1 when you started the container. For security reasons, it's important to use a strong, unique password, especially in production environments.

- `--server.database _system:` This option specifies the name of the database to connect to. \_system is the default system database provided by ArangoDB for managing the server.

### Web Interface

You can use the included [web interface](https://docs.arangodb.com/3.11/components/web-interface/). The ArangoDB server serves this graphical user interface (GUI) and you can access it by pointing your browser to the server’s endpoint, which is <http://localhost:8529> by default if you run a local server.

(c) LexTego ltd 2021-2024
