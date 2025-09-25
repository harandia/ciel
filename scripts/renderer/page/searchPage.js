/**
 * Represents a SearchPage.
 * @class
 */
class SearchPage {
	/**@type {Set<string>} */
	_searchTags;

	/**@param {string[]} searchTags*/
	constructor(searchTags) {
		searchTags.forEach((tag) => {
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
}

export default SearchPage;
