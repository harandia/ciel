import SearchPage from './searchPage.js';

/**
 * Represents a closed SearchPage.
 * @class
 */
class ClosedSearchPage extends SearchPage {
	/**
	 * Returns a serializable object with the search tags of the page in an array.
	 * @returns {{searchTags: string[]}}
	 */
	toJSON() {
		return {
			searchTags: this.searchTags,
		};
	}

	/**
	 * Returns a new SearchPage built from a serialized object like the ones returned by the toJSON() method.
	 * @param {{searchTags: string[]}} pageJSON
	 * @returns {ClosedSearchPage}
	 */
	static fromJSON(pageJSON) {
		return new ClosedSearchPage(pageJSON.searchTags);
	}

	/**
	 * Returns true or false wether this SearchPage has the same tags as otherPage or not.
	 * @param {ClosedSearchPage} otherPage
	 */
	equals(otherPage) {
		// @ts-ignore
		return this._searchTags.isSupersetOf(otherPage) && this._searchTags.isSubsetOf(otherPage);
	}
}

export default ClosedSearchPage;
