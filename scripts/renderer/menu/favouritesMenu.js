import OpenSearchPage from '../page/openSearchPage.js';
import SearchPage from '../page/searchPage.js';
import { addTab } from '../tab/tabBar.js';
import { StickyTooltip } from '../tooltip.js';
import SubmenuTab from './submenuTab.js';

const stickyTooltip = new StickyTooltip();

class FavouritesMenu {
	/**@type {Element} */
	#element;

	/**@type {SubmenuTab[]} */
	#favList;

	/** Builds the Favourites Menu with all the stored favourite pages.*/
	constructor() {
		this.#element = document.getElementById('favourites-menu');
		this.#favList = [];

		window.app.getFavs().then((favs) => {
			for (const fav of favs) {
				const tab = SubmenuTab.fromJSON(fav);
				this.#addTab(tab);
			}
		});
	}

	/**
	 * Adds a new page to favourites.
	 * @param {SearchPage} favPage
	 */
	async addFav(favPage) {
		const submenuTab = new SubmenuTab(favPage, await window.app.date());

		this.#addTab(submenuTab);

		window.app.updateFavs(this.#favList.map((tab) => tab.toJSON()));
	}

	/**
	 * Adds a new tab to the menu.
	 * @param {SubmenuTab} tab
	 */
	async #addTab(tab) {
		this.#favList.push(tab);

		tab.deleteButton.addEventListener('click', () => {
			this.#removeFavTab(tab);
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

		tab.element.addEventListener('mousedown', () => {
			let timeout;

			const cancelTimeout = () => {
				clearTimeout(timeout);
			};

			document.addEventListener('mouseup', cancelTimeout);

			timeout = setTimeout(() => {
				stickyTooltip.show(tab.page.searchTags.join(' '));

				document.removeEventListener('mouseup', cancelTimeout);

				document.addEventListener('mouseup', () => stickyTooltip.hide(), { once: true });

				this.#element.addEventListener(
					'mouseup',
					(event) => {
						let insertAfterElement;

						const tabElements = Array.from(this.#element.children).slice(1);

						for (const tab of tabElements) {
							const tabRect = tab.getBoundingClientRect();

							// @ts-ignore
							if (tabRect.y + tabRect.height / 2 < event.clientY) insertAfterElement = tab;
						}

						if (!insertAfterElement) {
							const firstTab = this.#element.children[1];
							this.#element.insertBefore(tab.element, firstTab);

							const oldIndex = this.#favList.indexOf(tab);
							this.#favList.splice(oldIndex, 1);
							this.#favList.splice(0, 0, tab);
						} else if (insertAfterElement.nextElementSibling) {
							this.#element.insertBefore(tab.element, insertAfterElement.nextElementSibling);

							const oldIndex = this.#favList.indexOf(tab);
							const newIndex = this.#favList.findIndex((tab) => tab.element === insertAfterElement.nextElementSibling);

							this.#favList.splice(oldIndex, 1);
							this.#favList.splice(newIndex, 0, tab);
						} else {
							this.#element.appendChild(tab.element);

							const oldIndex = this.#favList.indexOf(tab);
							this.#favList.splice(oldIndex, 1);
							this.#favList.push(tab);
						}

						window.app.updateFavs(this.#favList.map((tab) => tab.toJSON()));
					},
					{ once: true },
				);
			}, 200);
		});

		this.#element.appendChild(tab.element);
	}

	/**
	 * Removes a submenuTab from the list.
	 * @param {SubmenuTab} tab
	 */
	#removeFavTab(tab) {
		const tabIndex = this.#favList.indexOf(tab);
		this.#favList.splice(tabIndex, 1);
		this.#element.removeChild(tab.element);

		window.app.updateFavs(this.#favList.map((tab) => tab.toJSON()));
	}

	#hide() {
		this.#element.classList.add('submenu-hidden');
	}

	/**
	 * Removes a page from favourites.
	 * @param {SearchPage} favPage
	 */
	removeFav(favPage) {
		for (const tab of this.#favList) {
			if (tab.page.equals(favPage)) {
				this.#removeFavTab(tab);
			}
		}
	}

	/**
	 * Returns true if the given page is already marked as favourite.
	 * @param {SearchPage} searchPage
	 */
	isFavourite(searchPage) {
		for (const tab of this.#favList) {
			if (tab.page.equals(searchPage)) {
				return true;
			}
		}
		return false;
	}
}

const favouritesMenu = new FavouritesMenu();

export default favouritesMenu;
