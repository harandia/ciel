const fs = require('node:fs/promises');
const path = require('node:path');
const url = require('node:url');
// @ts-ignore
const mimeType = require('stream-mime-type');

const { FileTypeError, RequestError, InvalidURLError } = require('./errors');

const fileExtensions = {
	webp: 'webp',
	gif: 'gif',
	'x-icon': 'ico',
	jpeg: 'jpeg',
	'svg+xml': 'svg',
	apng: 'apng',
	avif: 'avif',
	bmp: 'bmp',
	jpg: 'jpeg',
	jpe: 'jpeg',
	png: 'png',
};

/**
 * Given a https (or http) or file:// URL if source is a string, or a Blob.
 * It copies the contents of the source in the indicated file path in a file
 * with the name fileName (the file extension will be added by the method itself, DON'T WRITE IT). Returns the path of the new file.
 * @param {string} sourceURL
 * @param {string} destPath
 * @param {string} fileName
 * @returns {Promise<string>}
 */
const downloadImage = async function (sourceURL, destPath, fileName) {
	let sourceFile;
	let sourceResponse;
	let sourceStream;

	let destFile;
	try {
		if (sourceURL.startsWith('file://')) {
			sourceFile = await fs.open(url.fileURLToPath(sourceURL));
			sourceStream = sourceFile.readableWebStream();
		} else if (sourceURL.startsWith('https://') || sourceURL.startsWith('http://')) {
			sourceResponse = await fetch(sourceURL);
			if (!sourceResponse.ok || sourceResponse.body === null) {
				throw new RequestError();
			}
			sourceStream = sourceResponse.body;
		} else {
			throw new InvalidURLError();
		}
		const { stream, mime } = await mimeType.getMimeType(sourceStream);
		if (!mime.startsWith('image/') || !fileExtensions[mime.split('/')[1]]) {
			throw new FileTypeError();
		}
		const newPath = path.join(destPath, fileName + '.' + fileExtensions[mime.split('/')[1]]);
		destFile = await fs.open(newPath, 'ax');
		const fileWriter = new WritableStream({
			async write(chunk) {
				await destFile.write(chunk);
			},
		});
		await stream.pipeTo(fileWriter).catch((err) => {
			fs.unlink(newPath).catch((err) => {
				throw err;
			});
			throw err;
		});
		return newPath;
	} catch (err) {
		throw err;
	} finally {
		await sourceFile?.close().catch((err) => {
			throw err;
		});
		await destFile?.close().catch((err) => {
			throw err;
		});
	}
};

module.exports = downloadImage;
