/**
 * Represents an abstract SearchPage.
 * @class
 */
class SearchPage {
	/**@type {Set<string>} */
	_searchTags;

	/**
	 * Creates a new SearchPage with the specified search tags. This constructor shouldn't be used on its own as this
	 * class is abstract.
	 * @param {string[] | Set<string>} [searchTags]
	 */
	constructor(searchTags) {
		this._searchTags = new Set(searchTags);
	}

	/**
	 * Returns the search tags used in this page.
	 * @returns {string[]}
	 */
	get searchTags() {
		return Array.from(this._searchTags);
	}

	/**
	 * Returns true or false wether this SearchPage has the same tags as otherPage or not.
	 * @param {SearchPage} otherPage
	 */
	equals(otherPage) {
		// @ts-ignore
		return this._searchTags.isSupersetOf(otherPage) && this._searchTags.isSubsetOf(otherPage);
	}
}

export default SearchPage;
