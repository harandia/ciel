const { app } = require('electron');
const path = require('node:path');

const jsonIO = require('./general/jsonIO');

const configPath = path.join(app.getPath('userData'), 'config.json');

/**
 * Returns the saved app's configuration or undefined if it couldn't read the configuration.
 * @returns {Promise<Object | undefined>}
 */
const readConfig = async function () {
	try {
		return await jsonIO.read(configPath);
	} catch {
		return undefined;
	}
};

/**
 * @typedef {Object} Settings
 * @property {boolean} [openPrevTabs] - Open the previous session tabs.
 * @property {boolean} [showConfirmation] - Show dialog confirmation windows.
 * @property {boolean} [openInNewTab] - Open new pages in new tabs.
 * @property {number} [imageSize] - Imge size in pixels.
 * @property {number} [zoom] - Zoom percentage.
 * @property {string[]} [selectAllShcut] - Select all shortcut.
 * @property {string[]} [openTabShcut] - Open new tab shortcut.
 * @property {string[]} [closeTabShcut] - Close current tab shortcut.
 * @property {string[]} [zoomInShcut] - Zoom in shortcut.
 * @property {string[]} [zoomOutShcut] - Zoom out shortcut.
 */

/**
 * @typedef {Object} SettingsFuncs
 * @property {function(): Promise<Settings>} init - Initializes the settings with the stored values or the default ones (if there are no values stored) if they hadn't been initialized already.
 * @property {function(): Promise<void>} writeConfig - Writes the current configuration.
 * @property {Object|undefined} properties - Returns an object containing all the properties of the current settings, or undefined if they haven't been set already.
 * @property {function(): Object} toJSON - Returns a serializable object with all the current settings.
 */

/**
 * @type {Settings & SettingsFuncs}
 */
const settings = {
	init: async function () {
		const config = this.properties ||
			(await readConfig()) || {
				openPrevTabs: true,
				showConfirmation: true,
				openInNewTab: true,
				imageSize: 250,
				zoom: 100,
				selectAllShcut: ['control', 'a'],
				openTabShcut: ['control', 't'],
				closeTabShcut: ['control', 'w'],
				zoomInShcut: ['control', '+'],
				zoomOutShcut: ['control', '-'],
			};

		Object.assign(this, config);

		return this;
	},

	writeConfig: async function () {
		jsonIO.write(this, configPath);
	},

	get properties() {
		const config = {};
		const descs = Object.getOwnPropertyDescriptors(this);
		for (const [attr, desc] of Object.entries(descs)) {
			if (typeof desc.value !== 'function' && !desc.get) {
				config[attr] = this[attr];
			}
		}
		return Object.keys(config).length !== 0 ? config : undefined;
	},

	toJSON: function () {
		return this.properties || {};
	},
};

module.exports = settings;
