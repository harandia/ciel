import favouritesMenu from './favouritesMenu.js';
import historyMenu from './historyMenu.js';
import settingsMenu from './settingsMenu.js';

const menu = {
	favouritesMenu,
	historyMenu,
	settingsMenu,

	hideSubmenus: function () {
		menu.favouritesMenu.hide();
		menu.historyMenu.hide();
		menu.settingsMenu.hide();
	},
};

document.addEventListener('click', (event) => {
	menu.hideSubmenus();
	// @ts-ignore
	if (event.target.id === 'menu-favourites-button') {
		menu.favouritesMenu.open();
		// @ts-ignore
	} else if (event.target.id === 'menu-history-button') {
		menu.historyMenu.open();
		// @ts-ignore
	} else if (event.target.id === 'menu-settings-button') {
		menu.settingsMenu.open();
	}
});
