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
	 * Returns a new ClosedSearchPage built from a serialized object like the ones returned by the toJSON() method.
	 * @param {{searchTags: string[]}} pageJSON
	 * @returns {ClosedSearchPage}
	 */
	static fromJSON(pageJSON) {
		return new ClosedSearchPage(pageJSON.searchTags);
	}
}

export default ClosedSearchPage;
