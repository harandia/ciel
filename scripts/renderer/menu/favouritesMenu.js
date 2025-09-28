import ClosedSearchPage from '../page/closedSearchPage.js';
import Submenu from './submenu.js';

class FavouritesMenu extends Submenu {
	/**@type {Set<ClosedSearchPage>} */
	#favList;

	/** Builds the Favourites Menu with all the stored favourite pages.*/
	constructor() {
		super('#favourites-menu');
	}

	/**
	 * Adds a new page to favourites.
	 * @param {ClosedSearchPage} favPage
	 */
	addFav(favPage) {
		this.#favList.add(favPage);
	}

	/**
	 * Removes a page from favourites.
	 * @param {ClosedSearchPage} favPage
	 */
	removeFav(favPage) {
		this.#favList.delete(favPage);
	}
}

const favouritesMenu = new FavouritesMenu();

export default favouritesMenu;
