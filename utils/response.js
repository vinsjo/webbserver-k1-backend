/**
 * @param {import("http").ServerResponse} res
 * @param {Object} headers
 * @returns {import("http").ServerResponse}
 */
const setResponseHeaders = (res, headers = {}) => {
	if (!(headers instanceof Object)) return res;
	Object.entries(headers).forEach(([key, value]) =>
		res.setHeader(key, value)
	);
	return res;
};

/**
 * @param {import("http").ServerResponse} res
 * @param {Number} code
 */
const codeResponse = (res, code) => {
	res.statusCode = typeof code === 'number' ? code : 500;
	res.end();
};

/**
 * @param {import("http").ServerResponse} res
 * @param {(Array|Object)} data
 * @param {Number} code
 * @param {Object} headers
 */
const jsonResponse = (res, data, code = 200) => {
	try {
		const json = JSON.stringify(data);
		res.writeHead(code, {
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(json),
		}).end(json);
	} catch (e) {
		console.error(e);
		res.statusCode = 500;
		res.end();
	}
};
/**
 * @param {Number} code
 * @param {String} reason
 */
const createError = (code, reason) => {
	return { code, error: reason };
};
/**
 * @param {import("http").ServerResponse} res
 * @param {Number} code
 * @param {String} reason
 */
const jsonErrorResponse = (res, code, reason = null) => {
	const defaultMessages = {
		400: 'Bad Request',
		404: 'Not Found',
		500: 'Internal Server Error',
	};
	if (!code) code = 500;
	if (!reason) {
		reason = defaultMessages[code] || 'An Unknown Error Occurred';
	}
	jsonResponse(res, { error: reason }, code);
};

module.exports = {
	setResponseHeaders,
	codeResponse,
	jsonResponse,
	createError,
	jsonErrorResponse,
};
