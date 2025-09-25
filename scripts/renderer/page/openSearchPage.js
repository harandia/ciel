import ClosedSearchPage from './closedSearchPage.js';
import SearchPage from './searchPage.js';

/**
 * Represents an open SearchPage.
 * @class
 */
class OpenSearchPage extends SearchPage {
	#newSearchTags;

	/** @param {ClosedSearchPage} searchPage*/
	constructor(searchPage) {
		super(searchPage.searchTags);
		this.#newSearchTags = new Set();
	}

	/**
	 * Adds tag as a new search tag to the page.
	 * @param {string} tag
	 */
	addSearchTag(tag) {
		this.#newSearchTags.add(tag);
	}

	/**
	 * Removes the specified tag from the seach tags of the page.
	 * @param {string} tag
	 */
	removeSearchTag(tag) {
		this.#newSearchTags.delete(tag);
	}

	/**
	 * Search the images with the corresponding tags.
	 */
	search() {
		// @ts-ignore
		this._searchTags = this._searchTags.union(this.#newSearchTags);
	}

	/**
	 * Returns the page closed as a ClosedSearchPage.
	 * @returns {ClosedSearchPage}
	 */
	close() {
		return new ClosedSearchPage(this.searchTags);
	}
}

export default OpenSearchPage;
