import ClosedSearchPage from './closedSearchPage.js';
import Editor from './components/editor.js';
import ImageGrid from './components/imageGrid.js';
import SearchBar from './components/searchbar.js';
import SearchPage from './searchPage.js';

/**
 * Represents an open SearchPage.
 * @class
 */
class OpenSearchPage extends SearchPage {
	/** @type {Set<string>} */
	#unsearchedTags;

	/** @type {SearchBar} */
	#searchBar;
	/** @type {ImageGrid} */
	#imageGrid;
	/** @type {Editor} */
	#editor;
	/** @type {HTMLElement[]} */
	#elements;

	/** @type {Function[]}} */
	#onClose;
	/** @type {Function[]} */
	#onSearch;

	/** @param {SearchPage | string[] | Set<string>} [param]*/
	constructor(param) {
		if (param) {
			if (param instanceof SearchPage) {
				super(param.searchTags);
			} else {
				super(param);
			}
		} else {
			super();
		}
		this.#unsearchedTags = new Set(this._searchTags);

		this.#onClose = [];
		this.#onSearch = [];

		//@ts-ignore
		const pageFragment = document.getElementById('search-page').content.cloneNode(true);

		this.#elements = Array.from(pageFragment.children);

		this.#searchBar = new SearchBar(pageFragment.querySelector('.searchbar-container'));
		this.#imageGrid = new ImageGrid(pageFragment.querySelector('.image-grid'));
		this.#editor = new Editor(pageFragment.querySelector('.editor'));
	}

	/**
	 * Adds tag as a new search tag to the page, the tag won't be used until search() is called.
	 * @param {string} tag
	 */
	addSearchTag(tag) {
		this.#unsearchedTags.add(tag);
	}

	/**
	 * Removes the specified tag from the seach tags of the page, the change won't be effective until search() is called.
	 * @param {string} tag
	 */
	removeSearchTag(tag) {
		this.#unsearchedTags.delete(tag);
	}

	/**
	 * Returns a new OpenSearchPage with all changes made to the page's tags applied.
	 * @returns {OpenSearchPage}
	 */
	search() {
		// @ts-ignore
		const newPage = new OpenSearchPage(this.#unsearchedTags);

		for (const func of this.#onSearch) func(newPage);

		return newPage;
	}

	/**
	 * Returns the page closed as a ClosedSearchPage.
	 * @returns {ClosedSearchPage}
	 */
	close() {
		const closedPage = new ClosedSearchPage(this.searchTags);

		for (const func of this.#onClose) func(closedPage);

		return closedPage;
	}

	/**
	 * Renders the page.
	 */
	render() {
		this.derender();
		for (const element of this.#elements) {
			document.querySelector('main').appendChild(element);
		}
	}

	/**
	 * Unrenders the page.
	 */
	derender() {
		const main = document.querySelector('main');
		for (const child of Array.from(main.children)) {
			// @ts-ignore
			if (this.#elements.includes(child)) main.removeChild(child);
		}
	}

	/**
	 * Sets the given function to execute when the specified event is triggered. Functions will be given the new searched page as
	 * an argument if the eventType is 'search', if it's 'close' it will be given the page closed as a CloseSearchTab.
	 * @param {'search' | 'close'} eventType
	 * @param {Function} callback
	 */
	addEventListener(eventType, callback) {
		if (eventType === 'close' && !this.#onClose.includes(callback)) {
			this.#onClose.push(callback);
		} else if (eventType === 'search' && !this.#onSearch.includes(callback)) {
			this.#onSearch.push(callback);
		}
	}

	/**
	 * Removes the event listener of the specified type with the specified function.
	 * @param {'search' | 'close'} eventType
	 * @param {Function} callback
	 */
	removeEventListener(eventType, callback) {
		let eventCallbacks;
		if (eventType === 'close') eventCallbacks = this.#onClose;
		else if (eventType === 'search') eventCallbacks = this.#onSearch;

		eventCallbacks.splice(
			eventCallbacks.findIndex((func) => func === callback),
			1,
		);
	}
}

export default OpenSearchPage;
