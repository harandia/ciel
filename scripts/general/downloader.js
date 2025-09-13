const fs = require('node:fs/promises');

/**
 * Downloads the content of sourceURL in destPath.
 * @param {string} sourceURL
 * @param {string} destPath
 */
const download = async function (sourceURL, destPath) {
	let destFile;
	try {
		const downloadResponse = await fetch(sourceURL);
		if (!downloadResponse.ok || downloadResponse.body === null) {
			throw new RequestError('Request to download the file failed.');
		}
		destFile = await fs.open(destPath, 'ax');
		const fileWriter = new WritableStream({
			async write(chunk) {
				await destFile.write(chunk);
			},
		});
		await downloadResponse.body.pipeTo(fileWriter).catch((err) => {
			try {
				fs.unlink(destPath);
				throw err;
			} catch (err) {
				throw err;
			}
		});
	} catch (err) {
		throw err;
	} finally {
		destFile?.close().catch((err) => {
			throw err;
		});
	}
};

class RequestError extends Error {}
