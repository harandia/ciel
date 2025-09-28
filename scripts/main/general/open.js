const { shell } = require('electron');
const fs = require('node:fs/promises');
// @ts-ignore
const mimeType = require('stream-mime-type');
const { FileTypeError } = require('./errors');
const path = require('node:path');

/**
 * Opens the image in the given path with the default desktop's behaviour.
 * @param {string} path
 */
const openImage = async function (path) {
	let ogStream;
	let newStream;

	let file;
	try {
		file = await fs.open(path);
		ogStream = file.readableWebStream();
		const { stream, mime } = await mimeType.getMimeType(ogStream);
		newStream = stream;
		if (!mime.startsWith('image/')) {
			throw new FileTypeError();
		}
		await shell.openPath(path);
	} catch (err) {
		throw err;
	} finally {
		await newStream?.cancel().catch((err) => {
			throw err;
		});
		await file?.close().catch((err) => {
			throw err;
		});
	}
};

module.exports = openImage;
