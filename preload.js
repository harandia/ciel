const { contextBridge, ipcRenderer, webFrame, webUtils } = require('electron');

contextBridge.exposeInMainWorld('app', {
	/**
	 * Returns the app's settings.
	 * @returns {Promise<import('./scripts/main/settings.js').Settings>}
	 */
	getSettings: () => {
		return ipcRenderer.invoke('get-settings');
	},
	/**
	 * Updates the app's settings.
	 * @param {import('./scripts/main/settings.js').Settings} config
	 */
	updateSettings: (config) => {
		ipcRenderer.send('update-settings', config);
	},
	/**
	 * Sets the application zoom given the zoom percentage.
	 * @param {number} zoom
	 */
	setZoom: (zoom) => {
		webFrame.setZoomFactor(zoom / 100);
	},
	/**
	 * Returns true if the tag exists in the database.
	 * @param {string} tag
	 * @returns {Promise<boolean>}
	 */
	existTag: (tag) => {
		return ipcRenderer.invoke('exist-tag', tag);
	},
	/**
	 * Returns all the tags stored in the database.
	 * @returns {Promise<string[]>}
	 */
	getTags: () => {
		return ipcRenderer.invoke('all-tags');
	},

	/**
	 * Returns the paths of all the images that have the provided searchTags and DON'T have the excludedTags.
	 * @param {string | string[]} searchTags
	 * @param {string | string[]} excludedTags
	 * @returns {Promise<string[]>}
	 */
	searchImage: (searchTags, excludedTags) => {
		return ipcRenderer.invoke('search-image', searchTags, excludedTags);
	},

	/**
	 * Returns the paths of all the images stored in the database.
	 * @returns {Promise<string[]>}
	 */
	getAllImages: () => {
		return ipcRenderer.invoke('all-images');
	},

	/**
	 * Returns all the tags associated with an image path (absolute path). The image needs to be located in the app's data folder.
	 * @param {string} image
	 * @returns {Promise<string>}
	 */
	getImageTags: (imagePath) => {
		return ipcRenderer.invoke('image-tags', imagePath);
	},

	/**
	 * Returns true if the image is successfully removed (file and database). The image needs to be located in the app's data folder.
	 * @param {string | string[]} imagePaths
	 * @return {Promise<boolean>}
	 */
	deleteImage: (imagePaths) => {
		return ipcRenderer.invoke('delete-image', imagePaths);
	},

	/**
	 * Opens the given image. The image needs to be located in the app's data folder.
	 * @param {string} imagePath
	 */
	openImage: (imagePath) => {
		ipcRenderer.send('open-image', imagePath);
	},

	/**
	 * Updates the image associated tags. The image needs to be located in the app's data folder.
	 * @param {string} imagePath
	 * @param {{addedTags: string[], deletedTags: string[]}} changes
	 */
	updateImage: (imagePath, changes) => {
		ipcRenderer.send('update-image', imagePath, changes);
	},

	/**
	 * Shows a warning dialog with the given options. Returns the index of the button pulsed by the user or the defaultId (in case the window is closed).
	 * @param {string} title
	 * @param {string} message
	 * @param {string []} buttons
	 * @param {number} defaultId
	 * @returns {Promise<number>}
	 */
	showWarning: (title, message, buttons, defaultId) => {
		return ipcRenderer.invoke('show-warning', title, message, buttons, defaultId);
	},

	/**
	 * Tries to close the app.
	 * @param {string[]} [uploadingImages]
	 */
	tryClose: (uploadingImages) => {
		ipcRenderer.send('try-close', uploadingImages);
	},

	/**
	 * Returns the file path.
	 * @param {File} file
	 * @returns {Promise<string>}
	 */
	getFilePath: (file) => {
		return webUtils.getPathForFile(file);
	},

	/**
	 * Downloads the given image and returns the path of the image on success or undefined if the download fails.
	 * If param is a string, it should be either a http, https, blob or file URL pointing to an image.
	 * @param {string | Uint8Array} param
	 * @return {Promise<string | undefined>}
	 */
	downloadImage: (param) => {
		return ipcRenderer.invoke('download-image', param);
	},

	/**
	 * Deletes the given image, the image should only be located in the app's images folder.
	 * @param {string} image
	 */
	deleteTempImage: (image) => {
		ipcRenderer.send('delete-temp-image', image);
	},
});
