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
	 * Returns the app's settings.
	 * @returns {Promise<{page: {searchTags: string[]}, date: string}>}
	 */
	getFavs: () => {
		return ipcRenderer.invoke('get-favs');
	},
	/**
	 * Updates the app's settings.
	 * @param {{page: {searchTags: string[]}, date: string}[]} favs
	 */
	updateFavs: (favs) => {
		ipcRenderer.send('update-favs', favs);
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
	 * Returns all the tags associated with an image path (absolute path) or an empty array. The image needs to be located in the app's data folder.
	 * @param {string} image
	 * @returns {Promise<string[]>}
	 */
	getImageTags: (imagePath) => {
		return ipcRenderer.invoke('image-tags', imagePath);
	},

	/**
	 * Returns true if the image is successfully removed (file and database). The image needs to be located in the app's data folder.
	 * If force is true, no warning will be prompt.
	 * @param {string | string[]} imagePaths
	 * @param {boolean} [force]
	 * @return {Promise<boolean>}
	 */
	deleteImage: (imagePaths, force) => {
		return ipcRenderer.invoke('delete-image', imagePaths, force);
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
	 * @param {string} param
	 * @return {Promise<string | Promise<undefined>}
	 */
	downloadImage: (param) => {
		return ipcRenderer.invoke('download-image', param);
	},

	/**
	 * Deletes the given image, the image should only be located in the app's images folder.
	 * @param {string} image
	 */
	deleteTempImage: (image, force) => {
		ipcRenderer.send('delete-temp-image', image);
	},

	/**
	 * Downloads the image stored in the clipboard and returns the path of the image on success or undefined if the download fails.
	 * @returns {Promise<string> | Promise<undefined>}
	 */
	downloadCopiedImage: () => {
		return ipcRenderer.invoke('download-copied-image');
	},

	/**
	 * Opens a file selection window and returns the paths of the selected files, or undefined if no file was selected.
	 * @returns {Promise<string[] | undefined>}
	 */
	openFileDialog: () => {
		return ipcRenderer.invoke('open-file-dialog');
	},

	/**
	 * Returns the path route of the given file URL.
	 * @param {string} url
	 * @returns {Promise<string>}
	 */
	fileURLToPath: (url) => {
		return ipcRenderer.invoke('file-url-to-path', url);
	},

	/**
	 * Registers an image in the database and associates it with the given tags. The image should be located in the app's images folder.
	 * @param {string} imagePath
	 * @param {string[]} tags
	 */
	registerImage: (imagePath, tags) => {
		ipcRenderer.send('register-image', imagePath, tags);
	},

	/**
	 * Returns a string representing today's date formated like dddd D, MMMM
	 * @param {string} dateStr
	 * @returns {Promise<string>}
	 */
	date: (dateStr) => {
		return ipcRenderer.invoke('date');
	},

	/**
	 * Compares date1 and date2 and returns an object with three properties:
	 * equals (true if date1 and date2 are the same).
	 * greater (true if date1 is ahead of date2).
	 * less (true if date1 is before date2).
	 * @param {string} date1
	 * @param {string} date2
	 * @returns {Promise<{equals: boolean, after: boolean, before: boolean}>}
	 */
	compareDate: (date1, date2) => {
		return ipcRenderer.invoke('compare-date', date1, date2);
	},
});
