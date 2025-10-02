import ClosedSearchPage from './page/closedSearchPage.js';
import OpenSearchPage from './page/openSearchPage.js';
import UploadPage from './page/uploadPage.js';

class Tab {
	/**@type {UploadPage | OpenSearchPage} */
	#page;
	/**@type {HTMLElement} */
	#element;

	/**@type {(ClosedSearchPage | UploadPage)[]} */
	#prevPages;
	/**@type {(ClosedSearchPage | UploadPage)[]} */
	#nextPages;

	constructor(page) {
		this.#page = page;

		// @ts-ignore
		this.#element = document.getElementById('tab').content.cloneNode(true).querySelector('.tab');
		this.#update();

		this.#prevPages = [];
		this.#nextPages = [];
	}

	/**
	 * Selects the tab.
	 */
	select() {
		this.#element.querySelector('.tab-body').classList.remove('tab-body-closed');
	}

	/**
	 * Deselects the tab.
	 */
	deselect() {
		this.#element.querySelector('.tab-body').classList.add('tab-body-closed');
	}

	/**
	 * Updates the tab's title.
	 */
	#update() {
		this.#element.querySelector('.tab-title').textContent = this.title;
	}

	/**
	 * Loads the given page. It clears the tab's history following the current tab's page and adds the current page to it.
	 * @param {OpenSearchPage | UploadPage} page
	 */
	loadPage(page) {
		this.#prevPages.push(this.#page);
		this.#nextPages = [];

		this.#page = page;

		this.#update();
	}

	/**
	 * Loads the the previous page in the tab history. This method should only be used if prevPages isn't empty.
	 */
	loadPrevPage() {
		this.#nextPages.push(this.#page);

		this.#page = this.#prevPages.pop();
	}

	/**
	 * Loads the the next page in the tab history. This method should only be used if nextPages isn't empty.
	 */
	loadNextPage() {
		this.#prevPages.push(this.#page);

		this.#page = this.#nextPages.pop();
	}

	/**
	 * Returns the HTML close button of the tab.
	 */
	get closeButton() {
		return this.#element.querySelector('.tab-close-tab-button');
	}

	/**
	 * Returns the HTML element of the tab.
	 */
	get element() {
		return this.#element;
	}

	/**
	 * Returs the loaded page.
	 */
	get page() {
		return this.#page;
	}

	/**
	 * Returns the title corresponding to the page
	 */
	get title() {
		if (this.#page instanceof UploadPage) return 'Upload page';
		if (this.#page.searchTags.length === 0) return 'New search';
		return this.#page.searchTags.join(' ');
	}

	/**
	 * Returns the pages previously loaded in the tab.
	 */
	get prevPages() {
		return this.#prevPages;
	}

	/**
	 * If if in a previous page is currently loaded, returns the following pages.
	 */
	get nextPages() {
		return this.#nextPages;
	}
}

export default Tab;
