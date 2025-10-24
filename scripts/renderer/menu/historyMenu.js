import OpenSearchPage from '../page/openSearchPage.js';
import SearchPage from '../page/searchPage.js';
import { addTab } from '../tab/tabBar.js';
import { StickyTooltip } from '../tooltip.js';
import SubmenuTab from './submenuTab.js';

const stickyTooltip = new StickyTooltip();

class HistoryMenu {
	/**@type {Element} */
	#element;

	/**@type {SubmenuTab[]} */
	#tabList;

	/** Builds the Favourites Menu with all the stored favourite pages.*/
	constructor() {
		this.#element = document.getElementById('history-menu');
		this.#tabList = [];

		window.app.getHistory().then((history) => {
			for (let i = history.length - 1; i >= 0; i--) {
				const tab = SubmenuTab.fromJSON(history[i]);
				this.#addTab(tab);
			}
		});
	}

	/**
	 * Adds a new page to favourites.
	 * @param {SearchPage} page
	 */
	async addHistory(page) {
		const submenuTab = new SubmenuTab(page, await window.app.date());

		this.#addTab(submenuTab);

		window.app.updateHistory(this.#tabList.map((tab) => tab.toJSON()));
	}

	/**
	 * Adds a new tab to the menu.
	 * @param {SubmenuTab} tab
	 */
	async #addTab(tab) {
		this.#tabList.splice(0, 0, tab);

		tab.deleteButton.addEventListener('click', () => {
			this.#removeTab(tab);
		});

		tab.element.addEventListener('click', async (event) => {
			if (event.target !== tab.deleteButton) {
				addTab(await OpenSearchPage.open(tab.page));
				this.#hide();
			}
		});

		tab.element.addEventListener('dragstart', (event) => {
			event.preventDefault();
		});

		console.log(tab.date);
		console.log(this.#tabList[0].date);

		if (!this.#tabList[1] || tab.date !== this.#tabList[1].date) {
			const h2 = document.createElement('h2');
			h2.textContent = this.#tabList[0].date;
			this.#element.insertBefore(h2, this.#element.children[1]);
		}

		this.#element.insertBefore(tab.element, this.#element.children[2]);
	}

	/**
	 * Removes a submenuTab from the list.
	 * @param {SubmenuTab} tab
	 */
	#removeTab(tab) {
		const tabIndex = this.#tabList.indexOf(tab);
		this.#tabList.splice(tabIndex, 1);

		if (
			!SubmenuTab.isSubmenuTab(tab.element.previousElementSibling) &&
			(!tab.element.nextElementSibling || !SubmenuTab.isSubmenuTab(tab.element.nextElementSibling))
		) {
			this.#element.removeChild(tab.element.previousElementSibling);
		}
		this.#element.removeChild(tab.element);

		window.app.updateHistory(this.#tabList.map((tab) => tab.toJSON()));
	}

	#hide() {
		this.#element.classList.add('submenu-hidden');
	}

	/**
	 * Removes a page from favourites.
	 * @param {SearchPage} favPage
	 */
	removeHistory(favPage) {
		for (const tab of this.#tabList) {
			if (tab.page.equals(favPage)) {
				this.#removeTab(tab);
			}
		}
	}
}

const historyMenu = new HistoryMenu();

export default historyMenu;
