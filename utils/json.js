const fs = require('fs/promises');

const encode = (data) => {
	try {
		const json = JSON.stringify(data);
		return json;
	} catch (e) {
		return null;
	}
};

/**
 * @param {String} json
 */
const decode = (json) => {
	try {
		const data = JSON.parse(json);
		return data;
	} catch (e) {
		return null;
	}
};

/**
 * @param {String} path
 */
const read = async (path) => {
	try {
		const buffer = await fs.readFile(path);
		const json = decode(buffer.toString());
		if (!json) throw 'Invalid JSON Format';
		return json;
	} catch (e) {
		console.error(e);
		return null;
	}
};
/**
 * @param {String} path
 * @param {(Array|Object)} data
 */
const write = async (path, data) => {
	try {
		const json = encode(data);
		if (!json) throw 'Invalid JSON Format';
		await fs.writeFile(path, json);
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
};

module.exports = { read, write, encode, decode };
