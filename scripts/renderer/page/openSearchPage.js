import ClosedSearchPage from './closedSearchPage.js';
import SearchPage from './searchPage.js';

/**
 * Represents an open SearchPage.
 * @class
 */
class OpenSearchPage extends SearchPage {
	/** @type {Set<string>} */
	#unsearchedTags;

	/** @param {ClosedSearchPage} [searchPage]*/
	constructor(searchPage) {
		if (searchPage) {
			super(searchPage.searchTags);
		} else {
			super();
		}
		this.#unsearchedTags = new Set();
	}

	/**
	 * Adds tag as a new search tag to the page.
	 * @param {string} tag
	 */
	addSearchTag(tag) {
		if (!this._searchTags.has(tag)) this.#unsearchedTags.add(tag);
	}

	/**
	 * Removes the specified tag from the seach tags of the page.
	 * @param {string} tag
	 */
	removeSearchTag(tag) {
		this._searchTags.delete(tag);
		this.#unsearchedTags.delete(tag);
	}

	/**
	 * Search the images with the corresponding tags.
	 */
	search() {
		// @ts-ignore
		this._searchTags = this._searchTags.union(this.#unsearchedTags);
		this.#unsearchedTags.clear();
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
