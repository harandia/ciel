import OpenSearchPage from '../page/openSearchPage.js';
import UploadPage from '../page/uploadPage.js';
import { addTab } from '../tab/tabBar.js';
import { AbsoluteTooltip } from '../tooltip.js';

const submenus = {
	settings: document.getElementById('settings-menu'),
	history: document.getElementById('history-menu'),
	favourites: document.getElementById('favourites-menu'),
};

const tooltip = new AbsoluteTooltip(0, 0);

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
	} else if (event.target.id === 'menu-help-button') {
		window.app.openHelp();
	}
});

document.getElementById('menu-search-button').addEventListener('click', (event) => {
	addTab(new OpenSearchPage());
});

document.getElementById('menu-upload-button').addEventListener('click', (event) => {
	addTab(new UploadPage());
});

const menuButtons = Array.from(document.getElementById('menu').children);
for (const button of menuButtons) {
	button.addEventListener('mouseenter', () => {
		const buttonRect = button.getBoundingClientRect();
		const position = [buttonRect.left + 47, buttonRect.top + 5];

		tooltip.x = position[0];
		tooltip.y = position[1];

		let title;
		switch (button.id) {
			case 'menu-search-button':
				title = 'Search';
				break;
			case 'menu-upload-button':
				title = 'Upload';
				break;
			case 'menu-favourites-button':
				title = 'Favourites';
				break;
			case 'menu-history-button':
				title = 'History';
				break;
			case 'menu-help-button':
				title = 'Help';
				break;
			case 'menu-settings-button':
				title = 'Settings';
				break;
		}

		tooltip.show(title, 300);
	});

	button.addEventListener('mouseleave', () => {
		tooltip.hide();
	});
}

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
