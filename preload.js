const { contextBridge, ipcRenderer, webFrame } = require('electron');

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
});
