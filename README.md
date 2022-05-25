# Webbserver Kunskapskontroll 1 - Backend

## Instructions

Prerequisites:

-   [Node.js](https://nodejs.org/en/)

To start the server, run the following command:

```shell
node server.js
```

This will run the server on http://localhost:5000
To use another port, add an argument to the command with an integer value larger than 1024 and smaller than 10000.

#### Example:

```shell
node server.js 1337
```

This will run the server on http://localhost:1337

## Storage

The data stored in this application are stored in a json file which can be found at "/data/todos.json".

If the file doesn't exist when starting the server, it will be created.

All items stored in the application are in the following format:

```json
{
	"id": "4a2fc8b9d0faababa7d53801",
	"text": "Do Stuff",
	"completed": false,
	"created_at": 1653469428509
}
```

## Requests

Available Request methods and endpoints:

-   GET - http://localhost:5000/todos/
-   GET - http://localhost:5000/todos/:id
-   POST - http://localhost:5000/todos/
-   DELETE - http://localhost:5000/todos/:id
-   PUT - http://localhost:5000/todos/:id
-   PATCH - http://localhost:5000/todos/:id
