/**
 * This class represents an abstract SearchPage.
 * @class
 */
class SearchPage {
	/**@type {Set<string>} */
	_searchTags;

	/**
	 * This constructor shouldn't be called directly as this class is abstract.
	 * @param {string[]} [searchTags]
	 */
	constructor(searchTags) {
		this._searchTags = new Set();
		searchTags?.forEach((tag) => {
			this._searchTags.add(tag);
		});
	}

	/**
	 * Returns the search tags used in this page.
	 * @returns {string[]}
	 */
	get searchTags() {
		const tagsArray = [];
		for (const tag of this._searchTags) {
			tagsArray.push(tag);
		}
		return tagsArray;
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
