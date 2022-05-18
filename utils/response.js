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
 * @param {import("http").ServerResponse} res
 * @param {Number} code
 * @param {String} reason
 */
const jsonErrorResponse = (res, code, reason) => {
	jsonResponse(res, { code, reason }, code);
};

module.exports = {
	setResponseHeaders,
	codeResponse,
	jsonResponse,
	jsonErrorResponse,
};
