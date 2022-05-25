const fs = require('fs');
const json = require('../utils/json');
const { readRequestBody } = require('../utils/request');
const {
	codeResponse,
	jsonResponse,
	jsonErrorResponse,
	createError,
} = require('../utils/response');
const crypto = require('crypto');

const jsonDir = `${process.cwd()}/data`;
const jsonPath = `${jsonDir}/todos.json`;

if (!fs.existsSync(jsonDir)) {
	fs.mkdirSync(jsonDir);
}

if (!fs.existsSync(jsonPath)) {
	fs.writeFileSync(jsonPath, '[]');
}

/**
 * @typedef {{
 *	id:String,
 *	text: String,
 *	completed: Boolean,
 *	created_at: Number,
 *	completed_at: Number
 *	}} Task
 */
/**
 * @param {String} text
 * @returns {Task}
 */
const createTask = (text) => {
	return {
		id: crypto.randomBytes(12).toString('hex'),
		text,
		completed: false,
		created_at: Date.now(),
	};
};

/**
 * @callback RequestHandler
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {String[]} params
 * @returns {Promise}
 */
/**
 * @callback RequestCallback
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {Task[]} todos
 * @param {(String|null)} [id]
 * @returns {(Promise)}
 */
/**
 * @param {RequestCallback} requestCallback
 * @returns {RequestHandler}
 */
const createRequestHandler = (requestCallback) => {
	return async (req, res, params) => {
		if (params.length > 1) throw 404;
		const [id] = params;
		const todos = await json.read(jsonPath);
		if (!todos) throw 500;
		await requestCallback(req, res, todos, id);
	};
};

// Request Methods: GET, POST, PUT, PATCH, DELETE

module.exports = {
	GET: createRequestHandler((req, res, todos, id) => {
		if (!id) return jsonResponse(res, todos);
		const task = todos.find((task) => task.id === id);
		if (!task) throw createError(404, 'Requestes Resource Not Found');
		jsonResponse(res, task);
	}),

	POST: createRequestHandler(async (req, res, todos, id) => {
		if (id) throw createError(400, 'Invalid POST URI');
		const data = await readRequestBody(req);
		if (!data) throw 500;
		if (!(data instanceof Object) || !data.text) {
			throw createError(400, "Required field 'text' cannot me empty");
		}

		const task = createTask(data.text);

		todos.push(task);
		await json.write(jsonPath, todos);

		console.log('new task added: ', task);

		jsonResponse(res, task, 201);
	}),

	DELETE: createRequestHandler(async (req, res, todos, id) => {
		if (!id) throw createError(400, 'Invalid DELETE URI');
		const index = todos.findIndex((task) => task.id === id);
		if (index < 0) throw createError(404, 'Requestes Resource Not Found');

		const [deleted] = todos.splice(index, 1);
		await json.write(jsonPath, todos);

		jsonResponse(res, deleted, 200);
	}),
	PATCH: createRequestHandler(async (req, res, todos, id) => {
		if (!id) throw createError(400, 'Invalid PATCH URI');

		const data = await readRequestBody(req);
		if (!data || !(data instanceof Object)) throw 500;

		const index = todos.findIndex((task) => task.id === id);
		if (index < 0) throw createError(404, 'Requestes Resource Not Found');
		const task = todos[index];
		let { text, completed, created_at } = data;

		if (typeof text !== 'string') text = task.text;
		if (typeof completed !== 'boolean') completed = task.completed;
		if (typeof created_at !== 'number') created_at = task.created_at;

		todos[index] = {
			...task,
			text,
			completed,
			created_at,
		};

		await json.write(jsonPath, todos);
		jsonResponse(res, todos[index]);
	}),
	PUT: createRequestHandler(async (req, res, todos, id) => {
		if (!id) throw createError(400, 'Invalid PUT URI');

		const data = await readRequestBody(req);
		if (!data || !(data instanceof Object)) throw 500;

		const index = todos.findIndex((task) => task.id === id);
		if (index < 0) throw createError(404, 'Requestes Resource Not Found');
		const task = todos[index];

		todos[index] = {
			...task,
			...data,
		};
		await json.write(jsonPath, todos);
		jsonResponse(res, todos[index]);
	}),
};
