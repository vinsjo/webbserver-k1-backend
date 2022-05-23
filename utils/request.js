const json = require('./json');
const { createError } = require('./response');

/**
 * @param {import("http").IncomingMessage} req
 * @returns {String[]}
 */
const splitRequestUrl = (req) => {
	return req.url.split('/').filter((item) => item.length > 0);
};

/**
 * @param {import("http").IncomingMessage} req
 * @returns {String[]}
 */
const readRequestBody = async (req) => {
	try {
		const data = await new Promise((resolve, reject) => {
			const chunks = [];
			req.on('data', (chunk) => chunks.push(chunk.toString()));
			req.on('end', () => {
				const data = json.decode(chunks.join(''));
				!data
					? reject(createError(400, 'Invalid JSON Format'))
					: resolve(data);
			});
		});
		return data;
	} catch (e) {
		throw e;
	}
};

module.exports = { splitRequestUrl, readRequestBody };
