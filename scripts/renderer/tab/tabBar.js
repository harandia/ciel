//@ts-nocheck
import OpenSearchPage from '../page/openSearchPage.js';
import UploadPage from '../page/uploadPage.js';
import Tab from './tab.js';
import { AbsoluteTooltip, StickyTooltip } from '../tooltip.js';

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

/**
 * @type {Tab}
 */
let selectedTab;

const addButton = tabBar.querySelector('.tab-add-button');

addButton.addEventListener('click', () => {
	addTab(new OpenSearchPage(), true);
});

const prevButton = document.querySelector('.prev-button');
const nextButton = document.querySelector('.next-button');

prevButton.addEventListener('click', () => {
	selectedTab.loadPrevPage();
});

nextButton.addEventListener('click', () => {
	selectedTab.loadNextPage();
});

tabBar.addEventListener('wheel', (event) => {
	// @ts-ignore
	tabBar.scrollLeft = tabBar.scrollLeft - event.deltaY;
});

window.addEventListener('beforeunload', async (event) => {
	if (tabs.some((tab) => tab.page.hasUnsavedChanges)) {
		event.preventDefault();

		const uploadingImages = [];
		for (const tab of tabs) {
			if (tab.page instanceof UploadPage && tab.page.hasUnsavedChanges) {
				uploadingImages.push(...tab.page.uploads.map((taggedImage) => taggedImage.image));
			}
		}

		if (uploadingImages.length !== 0) {
			window.app.tryClose(uploadingImages);
		} else {
			window.app.tryClose();
		}
		return;
	}
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

		tab.closeButton.addEventListener('click', async (event) => {
			event.stopPropagation();

			const { showConfirmation } = await window.app.getSettings();

			if (showConfirmation && tab.page.hasUnsavedChanges) {
				const choice = await window.app.showWarning('Warning', 'Are you sure you want to discard the changes?', ['Cancel', 'Yes, discard'], 0);

				if (choice === 0) return;

				if (choice === 1 && tab.page instanceof UploadPage) {
					for (const taggedImage of tab.page.uploads) {
						window.app.deleteTempImage(taggedImage.image);
					}
				}
			}

			const tabIndex = tabs.indexOf(tab);

			if (tabs.length > 1 && tab === selectedTab) {
				const newIndex = tabIndex - 1 < 0 ? 1 : tabIndex - 1;
				selectTab(tabs[newIndex]);
			} else if (tabs.length === 1) {
				selectedTab = undefined;
			}

			tabBar.removeChild(tab.element);

			tabs.splice(tabIndex, 1);

			tabTooltip.hide();

			tab.derender();
			updatePrevNext();
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

		tab.element.addEventListener('mousedown', (event) => {
			event.preventDefault();

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
			}, 200);

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
	if (tab === selectedTab) return;

	const onload = (tab) => {
		tab.render();
		updatePrevNext();
	};

	selectedTab?.deselect();
	selectedTab?.derender();
	selectedTab?.removeEventListener('loadpage', onload);

	selectedTab = tab;
	tab.select();
	tab.render();
	updatePrevNext();
	selectedTab.addEventListener('loadpage', onload);
};

/**
 * Updates the state othe previous and next page buttons.
 */
const updatePrevNext = function () {
	if (!selectedTab) {
		prevButton.classList.add('prev-next-disabled');
		nextButton.classList.add('prev-next-disabled');
	} else {
		if (selectedTab.prevPages.length === 0) {
			prevButton.classList.add('prev-next-disabled');
		} else {
			prevButton.classList.remove('prev-next-disabled');
		}

		if (selectedTab.nextPages.length === 0) {
			nextButton.classList.add('prev-next-disabled');
		} else {
			nextButton.classList.remove('prev-next-disabled');
		}
	}
};

export { addTab };
