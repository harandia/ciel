const fs = require('node:fs/promises');
const path = require('node:path');
const url = require('node:url');
// @ts-ignore
const mimeType = require('stream-mime-type');

/**
 * Given a https (or http) or file:// URL, it copies the contents of the URL in the indicated file path.
 * @param {string} sourceURL
 * @param {string} destPath
 */
const downloadImage = async function (sourceURL, destPath) {
	let sourceFile;
	let sourceResponse;
	let source;

	let destFile;
	try {
		if (sourceURL.startsWith('file://')) {
			sourceFile = await fs.open(url.fileURLToPath(sourceURL));
			source = sourceFile.readableWebStream();
		} else if (sourceURL.startsWith('https://') || sourceURL.startsWith('http://')) {
			sourceResponse = await fetch(sourceURL);
			if (!sourceResponse.ok || sourceResponse.body === null) {
				throw new RequestError();
			}
			source = sourceResponse.body;
		} else {
			throw new InvalidURLError();
		}
		const { stream, mime } = await mimeType.getMimeType(source);
		if (!mime.startsWith('image/')) {
			throw new FileTypeError();
		}
		destFile = await fs.open(destPath, 'ax');
		const fileWriter = new WritableStream({
			async write(chunk) {
				await destFile.write(chunk);
			},
		});
		await stream.pipeTo(fileWriter).catch((err) => {
			fs.unlink(destPath).catch((err) => {
				throw err;
			});
			throw err;
		});
	} catch (err) {
		throw err;
	} finally {
		sourceFile?.close().catch((err) => {
			throw err;
		});
		destFile?.close().catch((err) => {
			throw err;
		});
	}
};

class InvalidURLError extends Error {}
class RequestError extends Error {}
class FileTypeError extends Error {}

module.exports = downloadImage;
