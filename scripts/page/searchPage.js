/**
 * Represents a closed SearchPage.
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
	 * @returns {SearchPage}
	 */
	static fromJSON(pageJSON) {
		return new SearchPage(pageJSON.searchTags);
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
