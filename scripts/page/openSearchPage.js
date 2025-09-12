import SearchPage from './searchPage.js';

/**
 * Represents an open SearchPage.
 * @class
 */
class OpenSearchPage extends SearchPage {
	/** @param {SearchPage} searchPage*/
	constructor(searchPage) {
		super(searchPage.searchTags);
	}

	/**
	 * Adds tag as a new search tag to the page.
	 * @param {string} tag
	 */
	addSearchTag(tag) {
		this._searchTags.add(tag);
	}

	/**
	 * Removes the specified tag from the seach tags of the page.
	 * @param {string} tag
	 */
	removeSearchTag(tag) {
		this._searchTags.delete(tag);
	}
}

export default OpenSearchPage;
