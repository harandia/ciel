import favouritesMenu from './favouritesMenu.js';
import historyMenu from './historyMenu.js';
import settingsMenu from './settings.js';

const menu = document.querySelector('#menu');

const hideSubmenus = function () {
	favouritesMenu.hide();
	historyMenu.hide();
	settingsMenu.hide();
};

document.addEventListener('click', (event) => {
	hideSubmenus();
	// @ts-ignore
	if (event.target.id === 'menu-favourites-button') {
		favouritesMenu.open();
		// @ts-ignore
	} else if (event.target.id === 'menu-history-button') {
		historyMenu.open();
		// @ts-ignore
	} else if (event.target.id === 'menu-settings-button') {
		settingsMenu.open();
	}
});
