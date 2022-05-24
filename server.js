const http = require('http');
// const todoResponse = require('./routes/todos');
const todos = require('./routes/todos');
const { splitRequestUrl } = require('./utils/request');
const {
	codeResponse,
	setResponseHeaders,
	createError,
	jsonErrorResponse,
} = require('./utils/response');

const PORT = 5000;

http.createServer(async (req, res) => {
	try {
		console.log(`Incoming ${req.method}-request to ${req.url}`);

		setResponseHeaders(res, {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods':
				'OPTIONS, POST, GET, PUT, PATCH, DELETE',
			'Access-Control-Allow-Headers': 'Content-Type',
		});

		if (req.method === 'OPTIONS') return codeResponse(res, 204);

		const [route, ...params] = splitRequestUrl(req);

		if (route !== 'todos') throw 404;
		if (!todos[req.method]) {
			throw createError(405, 'Invalid Request Method');
		}

		await todos[req.method](req, res, params);
	} catch (e) {
		console.log(e);
		if (e instanceof Object && e.code && e.error) {
			return jsonErrorResponse(res, e.code, e.error);
		}
		jsonErrorResponse(res, typeof e === 'number' ? e : 500);
	}
}).listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
