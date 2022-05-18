const fs = require('fs');
const json = require('../utils/json');
const { readRequestBody } = require('../utils/request');
const { codeResponse, jsonResponse } = require('../utils/response');
const crypto = require('crypto');

const jsonPath = `${process.cwd()}/data/todos.json`;

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
		completed_at: 0,
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
		try {
			if (params.length > 1) throw 404;
			const [id] = params;
			const todos = await json.read(jsonPath);
			if (!todos) throw 500;
			await requestCallback(req, res, todos, id);
		} catch (e) {
			if (typeof e === 'number') return codeResponse(res, e);
			console.error('Request Error: ', e?.message || e);
			codeResponse(res, 500);
		}
	};
};

// Request Methods: GET, POST, PUT, PATCH, DELETE

module.exports = {
	GET: createRequestHandler((req, res, todos, id) => {
		if (!id) return jsonResponse(res, todos);
		const task = todos.find((task) => task.id === id);
		if (!task) throw 404;
		jsonResponse(res, task);
	}),

	POST: createRequestHandler(async (req, res, todos, id) => {
		if (id) throw 400;
		const data = await readRequestBody(req);
		if (!data) throw 500;
		if (!(data instanceof Object) || !data.text) throw 400;
		const task = createTask(data.text);

		todos.push(task);
		await json.write(jsonPath, todos);

		console.log('new task added: ', task);

		jsonResponse(res, task, 201);
	}),

	DELETE: createRequestHandler(async (req, res, todos, id) => {
		if (!id) throw 400;
		const index = todos.findIndex((task) => task.id === id);
		if (index < 0) throw 404;

		const [deleted] = todos.splice(index, 1);
		await json.write(jsonPath, todos);

		console.log('deleted task: ', deleted);

		codeResponse(res, 200);
	}),
	PUT: createRequestHandler(async (req, res, todos, id) => {
		if (!id) throw 400;

		const data = await readRequestBody(req);
		if (!data) throw 500;
		if (!(data instanceof Object)) throw 400;

		const index = todos.findIndex((task) => task.id === id);
		if (index < 0) throw 404;
		const task = todos[index];
		let { text, completed, completed_at } = data;

		if (typeof text !== 'string') text = task.text;

		if (typeof completed !== 'boolean') completed = task.completed;

		if (completed && !completed_at) completed_at = Date.now();
		else completed_at = 0;

		todos[index] = {
			...task,
			text,
			completed,
			completed_at,
		};

		console.log('updated task: ', todos[index]);
		await json.write(jsonPath, todos);
		jsonResponse(res, todos[index]);
	}),
	// Temporär quick-fix
	get PATCH() {
		return this.PUT;
	},
};
