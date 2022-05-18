const http = require('http');
// const todoResponse = require('./routes/todos');
const todos = require('./routes/todos');
const { splitRequestUrl } = require('./utils/request');
const { codeResponse, setResponseHeaders } = require('./utils/response');

const PORT = 5000;

http.createServer((req, res) => {
	try {
		console.log(`Incoming ${req.method}-request to ${req.url}`);

		setResponseHeaders(res, {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods':
				'OPTIONS, POST, GET, PUT, PATCH, DELETE',
			'Access-Control-Allow-Headers': 'Content-Type',
		});

		if (req.method === 'OPTIONS') throw 204;

		const [route, ...params] = splitRequestUrl(req);

		if (route !== 'todos') throw 404;
		if (!todos[req.method]) throw 400;

		todos[req.method](req, res, params);
	} catch (e) {
		codeResponse(res, typeof e === 'number' ? e : 500);
	}
}).listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
