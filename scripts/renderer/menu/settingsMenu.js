// @ts-nocheck
import { submenus } from './menu.js';

const settingsMenu = submenus.settings;

const settingsInput = {
	get chkOpenPrevTabs() {
		return settingsMenu.querySelector('.settings-open-last-session input');
	},
	get chkShowConfirmation() {
		return settingsMenu.querySelector('.settings-show-confirmation input');
	},
	get chkOpenInNewTab() {
		return settingsMenu.querySelector('.settings-open-in-new-tab input');
	},
	get sldeImageSize() {
		return settingsMenu.querySelector('.settings-image-size input');
	},
	get sldeZoom() {
		return settingsMenu.querySelector('.settings-zoom input');
	},
};

const shortcutSettingsPropertiesToDOMId = {
	selectAllShcut: 'shortcut-select-all',
	openTabShcut: 'shortcut-open-tab',
	closeTabShcut: 'shortcut-close-tab',
	zoomInShcut: 'shortcut-zoom-in',
	zoomOutShcut: 'shortcut-zoom-out',
};

//Start-up
window.addEventListener('load', async () => {
	const settings = await window.app.getSettings();
	document.documentElement.style.setProperty('--image-size', settings.imageSize);
	updateMenu(settings);
});

//Checkboxes
settingsInput.chkOpenInNewTab.addEventListener('change', (event) => {
	window.app.updateSettings({ openInNewTab: event.target.checked });
});

settingsInput.chkOpenPrevTabs.addEventListener('change', (event) => {
	window.app.updateSettings({ openPrevTabs: event.target.checked });
});

settingsInput.chkShowConfirmation.addEventListener('change', (event) => {
	window.app.updateSettings({ showConfirmation: event.target.checked });
});

//Sliders
document.querySelectorAll('.settings-slider').forEach((slider) => {
	slider.addEventListener('input', (event) => {
		updateSlider(event.target);
	});
});

settingsInput.sldeImageSize.addEventListener('change', (event) => {
	const value = Number(event.target.value);
	window.app.updateSettings({ imageSize: value });
	document.documentElement.style.setProperty('--image-size', value);
});

settingsInput.sldeZoom.addEventListener('change', (event) => {
	const value = Number(event.target.value);
	window.app.updateSettings({ zoom: value });
	window.app.setZoom(value);
});

//Shortcuts
settingsMenu.addEventListener('click', (event) => {
	if (event.target instanceof HTMLElement && !event.target.classList.contains('shortcut-change-button')) return;

	event.stopPropagation();

	const shortcut = event.target.parentElement;
	const keyList = shortcut.querySelector('.shortcut-key-list');

	shortcut.classList.add('shortcut-listening');
	const initialKeys = keyList.innerHTML;
	keyList.textContent = '';

	const keys = [];

	const listen = (event) => {
		event.preventDefault();
		if (event.repeat) return;
		keys.push(event.key);
		addKeyToShortcut(shortcut, event.key);
	};
	document.addEventListener('keydown', listen);

	const stopListening = () => {
		shortcut.classList.remove('shortcut-listening');
		document.removeEventListener('keydown', listen);

		if (keys.length === 0) {
			keyList.innerHTML = initialKeys;
		} else {
			const property = Object.keys(shortcutSettingsPropertiesToDOMId).find((key) => shortcutSettingsPropertiesToDOMId[key] === shortcut.id);
			const newSettings = {};
			newSettings[property] = keys;

			window.app.updateSettings(newSettings);
		}

		document.removeEventListener('click', stopListening);
		document.removeEventListener('keyup', stopListening);
	};
	document.addEventListener('click', stopListening);
	document.addEventListener('keyup', stopListening);
});

/**
 * Updates the values displayed in the settings menu.
 * @param {import('../../main/settings.js').Settings} settings
 */
const updateMenu = function (settings) {
	for (const [property, value] of Object.entries(settings)) {
		if (property === 'openPrevTabs') {
			settingsInput.chkOpenPrevTabs.checked = value;
		} else if (property === 'showConfirmation') {
			settingsInput.chkShowConfirmation.checked = value;
		} else if (property === 'openInNewTab') {
			settingsInput.chkOpenInNewTab.checked = value;
		} else if (property === 'imageSize') {
			settingsInput.sldeImageSize.value = value;
			updateSlider(settingsInput.sldeImageSize);
		} else if (property === 'zoom') {
			settingsInput.sldeZoom.value = value;
			window.app.setZoom(value);
			updateSlider(settingsInput.sldeZoom);
		} else if (property.endsWith('Shcut')) {
			const shortcut = document.getElementById(shortcutSettingsPropertiesToDOMId[property]);
			value.forEach((key) => {
				addKeyToShortcut(shortcut, key);
			});
		}
	}
};

/**
 * Updates the slider so the filled part matches the value.
 * @param {HTMLInputElement} slider
 */
const updateSlider = function (slider) {
	/**
	 * Returns the percent of the slider the value represents.
	 * @param {HTMLInputElement} slider
	 * @param {number} value
	 * @returns {number}
	 */
	const getSliderPercent = (slider) => {
		return ((Number(slider.value) - Number(slider.min)) / (Number(slider.max) - Number(slider.min))) * 100;
	};
	slider.style.setProperty('--slider-percent', getSliderPercent(slider));
};

/**
 * Adds a new key to the keys displayed in the listening shortcut.
 * @param {HTMLElement} shortcut
 * @param {string} key
 */
const addKeyToShortcut = function (shortcut, key) {
	const shortcutKeyList = shortcut.querySelector('.shortcut-key-list');
	/**
	 * Creates a new shortcut key element.
	 * @param {string} keyStr
	 * @returns {HTMLElement}
	 */
	const shortcutKey = (keyStr) => {
		const keyEl = document.getElementById('shortcut-key').content.cloneNode(true);

		const specialKeys = {
			Alt: 'Alt',
			Control: 'Ctrl',
			Shift: 'Shift',
			Enter: 'Enter',
			AltGraph: 'AltGr',
			Meta: '⊞',
		};
		specialKeys[' '] = 'Space';

		keyStr = specialKeys[keyStr] || keyStr.toUpperCase();

		keyEl.querySelector('.shortcut-key').textContent = keyStr;

		return keyEl;
	};
	shortcutKeyList.append(shortcutKey(key));
};
