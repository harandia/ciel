//@ts-nocheck
import OpenSearchPage from './page/openSearchPage.js';
import UploadPage from './page/uploadPage.js';

/**
 * @type {(OpenSearchPage | UploadPage)[]}
 */
const tabs = [];

const tabBar = document.getElementById('tab-bar');

const tabBarInput = {
	addButton: tabBar.querySelector('.tab-add-button'),
};

tabBarInput.addButton.addEventListener('click', () => {
	addTab('New search', new OpenSearchPage());
});

/**
 * Adds a new tab to the tab bar with the given title.
 * @param {string} title
 * @param {OpenSearchPage | UploadPage} page
 */
const addTab = function (title, page) {
	let tab = document.getElementById('tab').content.cloneNode(true);
	tab.querySelector('.tab-title').textContent = title;

	tabBar.insertBefore(tab, tabBar.lastElementChild);

	tab = tabBar.children[tabBar.children.length - 2];

	tab.querySelector('.tab-close-tab-button').addEventListener('click', (event) => {
		event.stopPropagation();

		if (tabBar.children.length > 2 && isSelected(tab)) {
			const nextTab = tab.previousElementSibling || tab.nextElementSibling;
			selectTab(nextTab);
		}
		tabBar.removeChild(tab);

		const tabIndex = tabs.indexOf(page);
		tabs.splice(tabIndex, 1);
	});

	tab.addEventListener('click', () => {
		selectTab(tab);
	});

	selectTab(tab);

	tabs.push(page);
};

/**
 * Selects the specified tab.
 * @param {OpenSearchPage | UploadPage} tab
 */
const selectTab = function (tab) {
	tab.querySelector('.tab-body').classList.remove('tab-body-closed');
	for (const otherTab of tabBar.children) {
		if (otherTab !== tab && otherTab !== tabBar.lastElementChild) {
			otherTab.querySelector('.tab-body').classList.add('tab-body-closed');
		}
	}
};

/**
 * Returns true if the specified tab is currently selected.
 * @param {OpenSearchPage | UploadPage} tab
 * @returns {boolean}
 */
const isSelected = function (tab) {
	if (tab.querySelector('.tab-body-closed')) return false;
	return true;
};

export { addTab };
