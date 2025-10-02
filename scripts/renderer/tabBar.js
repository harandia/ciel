//@ts-nocheck
import OpenSearchPage from './page/openSearchPage.js';
import UploadPage from './page/uploadPage.js';
import Tab from './tab.js';
import { AbsoluteTooltip, StickyTooltip } from './tooltip.js';

/**
 * @type {(Tab)[]}
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
/**
 * @type {Tab}
 */
let selectedTab;

tabBarInput.addButton.addEventListener('click', () => {
	addTab(new OpenSearchPage(), true);
});

/**
 * Adds a new tab to the tab bar with the given page. If forceNewTab is enabled it will add the page in a new tab regardless of the
 * configuration settings.
 * @param {OpenSearchPage | UploadPage} page
 * @param {boolean} [forceNewTab]
 */
const addTab = async function (page, forceNewTab = false) {
	const { openInNewTab } = await window.app.getSettings();

	if (openInNewTab || forceNewTab || tabs.length === 0) {
		const tab = new Tab(page);

		tabBar.insertBefore(tab.element, tabBar.lastElementChild);

		tab.closeButton.addEventListener('click', (event) => {
			event.stopPropagation();

			const tabIndex = tabs.indexOf(tab);

			if (tabs.length > 1 && tab === selectedTab) {
				const newIndex = tabIndex - 1 < 0 ? 1 : tabIndex;
				selectTab(tabs[newIndex]);
			}
			tabBar.removeChild(tab.element);

			tabs.splice(tabIndex, 1);

			tabTooltip.hide();
		});

		tab.closeButton.addEventListener('mousedown', (event) => {
			event.stopPropagation();
		});

		tab.element.addEventListener('click', () => {
			selectTab(tab);
		});

		tab.element.addEventListener('mouseenter', () => {
			const tabPosition = tab.element.getBoundingClientRect();
			const position = [tabPosition.left + 5, tabPosition.top + 40];

			tabTooltip.x = position[0];
			tabTooltip.y = position[1];
			tabTooltip.show(tab.title, 200);
		});

		tab.element.addEventListener('mouseleave', () => {
			tabTooltip.hide();
		});

		tab.element.addEventListener('dragstart', (event) => {
			event.preventDefault();
		});

		tab.element.addEventListener('mousedown', () => {
			let timeout;

			const cancelTimeout = () => {
				clearTimeout(timeout);
			};

			timeout = setTimeout(() => {
				document.removeEventListener('mouseup', cancelTimeout);

				movingTooltip.show(tab.title);

				document.addEventListener(
					'mouseup',
					() => {
						movingTooltip.hide();
						document.documentElement.style.removeProperty('cursor');
					},
					{ once: true },
				);

				document.documentElement.style.cursor = 'grabbing';

				tabBar.addEventListener(
					'mouseup',
					(event) => {
						const tabElements = tabBar.children;

						if (tabElements.length <= 2) return;

						const tabIndex = Array.from(tabElements).indexOf(tab.element);
						const tabRect = tab.element.getBoundingClientRect();

						const tabMidPoint = tabRect.x + tabRect.width / 2;

						let indexShift;

						if (event.clientX > tabMidPoint + tabRect.width) {
							indexShift = Math.trunc((event.clientX - tabMidPoint) / tabRect.width) + 1;
						} else if (event.clientX < tabMidPoint - tabRect.width) {
							indexShift = Math.trunc((event.clientX - tabMidPoint) / tabRect.width);
						} else return;

						const newIndex = Math.min(Math.max(0, tabIndex + indexShift), tabElements.length - 1);

						tabBar.insertBefore(tab.element, tabElements[newIndex]);
						tabs.splice(Math.max(newIndex, tabs.length - 1), 0, tabs[tabIndex]);
						tabs.splice(tabIndex, 1);
					},
					{ once: true },
				);
			}, 400);

			document.addEventListener('mouseup', cancelTimeout, { once: true });
		});

		selectTab(tab);

		tabs.push(tab);
	} else {
		selectedTab.loadPage(page);
	}
};

/**
 * Selects the specified tab.
 * @param {Tab} tab
 */
const selectTab = function (tab) {
	tab.select();
	for (const otherTab of tabs) {
		if (otherTab !== tab) {
			otherTab.deselect();
		}
	}
	selectedTab = tab;
};

export { addTab };
