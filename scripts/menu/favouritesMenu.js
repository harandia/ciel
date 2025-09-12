import Submenu from './submenu.js';

class FavouritesMenu extends Submenu {
	#favList;

	constructor() {
		super('#favourites-menu');
	}

	addFav(favPage) {
		this.#favList.splice(0, 0, favPage);
	}

	removeFav(favPage) {}
}

const favouritesMenu = new FavouritesMenu();

export default favouritesMenu;
