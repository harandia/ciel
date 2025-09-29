import OpenSearchPage from '../page/openSearchPage.js';
import UploadPage from '../page/uploadPage.js';
import { addTab } from '../tabBar.js';

const submenus = {
	settings: document.getElementById('settings-menu'),
	history: document.getElementById('history-menu'),
	favourites: document.getElementById('favourites-menu'),
};

document.addEventListener('click', (event) => {
	if (!(event.target instanceof HTMLElement)) return;
	const eventFromSubmenu = event.composedPath().some((element) => element instanceof HTMLElement && Object.values(submenus).includes(element));
	if (eventFromSubmenu) return;

	hideSubmenus();

	if (event.target.id === 'menu-favourites-button') {
		openSubmenu(submenus.favourites);
	} else if (event.target.id === 'menu-history-button') {
		openSubmenu(submenus.history);
	} else if (event.target.id === 'menu-settings-button') {
		openSubmenu(submenus.settings);
	}
});

document.getElementById('menu-search-button').addEventListener('click', (event) => {
	addTab(new OpenSearchPage());
});

document.getElementById('menu-upload-button').addEventListener('click', (event) => {
	addTab(new UploadPage());
});

/**
 * Hides all the submenus.
 */
const hideSubmenus = function () {
	for (const submenu of Object.values(submenus)) {
		submenu?.classList.add('submenu-hidden');
	}
};

/**
 * Opens the given submenu.
 * @param {Element} submenu
 */
const openSubmenu = function (submenu) {
	submenu.classList.remove('submenu-hidden');
};

export { submenus };
