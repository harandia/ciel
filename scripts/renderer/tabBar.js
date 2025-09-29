//@ts-nocheck
import OpenSearchPage from './page/openSearchPage.js';
import UploadPage from './page/uploadPage.js';
import { AbsoluteTooltip, StickyTooltip } from './tooltip.js';

/**
 * @type {(OpenSearchPage | UploadPage)[]}
 */
const tabs = [];

/**
 * @type {AbsoluteTooltip}
 */
const tabTooltip = new AbsoluteTooltip(0, 0);

/**
 * @type {StickyTooltip}
 */
const movingTooltip = new StickyTooltip();

const tabBar = document.getElementById('tab-bar');

const tabBarInput = {
	addButton: tabBar.querySelector('.tab-add-button'),
};

tabBarInput.addButton.addEventListener('click', () => {
	addTab(new OpenSearchPage());
});

/**
 * Adds a new tab to the tab bar with the given page.
 * @param {OpenSearchPage | UploadPage} page
 */
const addTab = function (page) {
	let tab = document.getElementById('tab').content.cloneNode(true);
	const title = getTitle(page);
	tab.querySelector('.tab-title').textContent = title;

	tabBar.insertBefore(tab, tabBar.lastElementChild);

	tab = tabBar.children[tabBar.children.length - 2];

	const closeButton = tab.querySelector('.tab-close-tab-button');

	closeButton.addEventListener('click', (event) => {
		event.stopPropagation();

		if (tabBar.children.length > 2 && isSelected(tab)) {
			const nextTab = tab.previousElementSibling || tab.nextElementSibling;
			selectTab(nextTab);
		}
		tabBar.removeChild(tab);

		const tabIndex = tabs.indexOf(page);
		tabs.splice(tabIndex, 1);

		tabTooltip.hide();
	});

	closeButton.addEventListener('mousedown', (event) => {
		event.stopPropagation();
	});

	tab.addEventListener('click', () => {
		selectTab(tab);
	});

	tab.addEventListener('mouseenter', () => {
		const tabPosition = tab.getBoundingClientRect();
		const position = [tabPosition.left + 5, tabPosition.top + 40];

		tabTooltip.x = position[0];
		tabTooltip.y = position[1];
		tabTooltip.show(title, 200);
	});

	tab.addEventListener('mouseleave', () => {
		tabTooltip.hide();
	});

	tab.addEventListener('dragstart', (event) => {
		event.preventDefault();
	});

	tab.addEventListener('mousedown', () => {
		movingTooltip.show(title);

		const hideTooltip = () => {
			movingTooltip.hide();
			document.documentElement.style.removeProperty('cursor');
			document.removeEventListener('mouseup', hideTooltip);
		};

		document.addEventListener('mouseup', hideTooltip);

		document.documentElement.style.cursor = 'grabbing';

		const moveTab = (event) => {
			const tabElements = tabBar.children;

			if (tabElements.length <= 2) return;

			const tabIndex = Array.from(tabElements).indexOf(tab);
			const tabRect = tab.getBoundingClientRect();

			const tabMidPoint = tabRect.x + tabRect.width / 2;

			let indexShift;

			if (event.clientX > tabMidPoint + tabRect.width) {
				indexShift = Math.trunc((event.clientX - tabMidPoint) / tabRect.width) + 1;
			} else if (event.clientX < tabMidPoint - tabRect.width) {
				indexShift = Math.trunc((event.clientX - tabMidPoint) / tabRect.width);
			} else return;

			const newIndex = Math.min(Math.max(0, tabIndex + indexShift), tabElements.length - 1);

			tabBar.insertBefore(tab, tabElements[newIndex]);
			tabs.splice(Math.max(newIndex, tabs.length - 1), 0, tabs[tabIndex]);
			tabs.splice(tabIndex, 1);

			tabBar.removeEventListener('mouseup', moveTab);
		};

		tabBar.addEventListener('mouseup', moveTab);
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
 * Updates the Tab Bar with the changes made to the tabs' pages.
 */
const updateTabBar = function () {
	const tabElements = tabBar.children;

	for (let i = 0; i < tabElements.length; i++) {
		tabElements[i].querySelector('.tab-title').textContent = getTitle(tabs[i]);
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

/**
 * Returns the title corresponding to the given page
 * @param {OpenSearchPage | UploadPage} page
 */
const getTitle = function (page) {
	if (page instanceof UploadPage) return 'Upload page';
	if (page.searchTags.length === 0) return 'New search';
	return page.searchTags.join(' ');
};

export { addTab };
