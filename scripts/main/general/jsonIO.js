const fs = require('node:fs/promises');
const path = require('node:path');

const jsonIO = {
	/**
	 * Writes (overwrites if it already exists) a JSON file with the JSON string of object in the specified path.
	 * @param {Object} object
	 * @param {string} path
	 */
	write: async function (object, path) {
		fs.writeFile(path, JSON.stringify(object), { encoding: 'utf-8' });
	},

	/**
	 * Returns the object parsed in the JSON file of the specified path, it returns undefined on error.
	 * @param {string} path
	 * @returns {Promise<Object>}
	 */
	read: async function (path) {
		try {
			return JSON.parse(await fs.readFile(path, { encoding: 'utf-8' }));
		} catch {
			return undefined;
		}
	},
};

module.exports = jsonIO;
