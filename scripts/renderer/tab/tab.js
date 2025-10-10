import ClosedSearchPage from '../page/closedSearchPage.js';
import OpenSearchPage from '../page/openSearchPage.js';
import UploadPage from '../page/uploadPage.js';

class Tab {
	/**@type {UploadPage | OpenSearchPage} */
	#page;
	/**@type {HTMLElement} */
	#element;

	/**@type {(ClosedSearchPage | UploadPage)[]} */
	#prevPages;
	/**@type {(ClosedSearchPage | UploadPage)[]} */
	#nextPages;

	/**@type {Function[]} */
	#onSelect;
	/**@type {Function[]} */
	#onPageLoad;
	/**@type {Function[]} */
	#onDeselect;

	/** @type {OpenSearchPage | UploadPage} */
	#renderedPage;

	/**
	 * @param {OpenSearchPage | UploadPage} page
	 */
	constructor(page) {
		this.#page = page;

		this.#page.addEventListener('search', (newPage) => {
			this.loadPage(newPage);
		});

		// @ts-ignore
		this.#element = document.getElementById('tab').content.cloneNode(true).querySelector('.tab');
		this.#updateTitle();

		this.#prevPages = [];
		this.#nextPages = [];

		this.#onSelect = [];
		this.#onPageLoad = [];
		this.#onDeselect = [];
	}

	/**
	 * Selects the tab.
	 */
	select() {
		this.#element.querySelector('.tab-body').classList.remove('tab-body-closed');

		for (const func of this.#onSelect) func(this);
	}

	/**
	 * Deselects the tab.
	 */
	deselect() {
		this.#element.querySelector('.tab-body').classList.add('tab-body-closed');

		for (const func of this.#onDeselect) func(this);
	}

	/**
	 * Updates the tab's title.
	 */
	#updateTitle() {
		this.#element.querySelector('.tab-title').textContent = this.title;
	}

	/**
	 * Sets this tab's current page.
	 * @param {OpenSearchPage | UploadPage} page
	 */
	#setPage(page) {
		this.#page = page;
		this.#updateTitle();

		if (page instanceof OpenSearchPage) {
			this.#page.addEventListener('search', (newPage) => {
				this.loadPage(newPage);
			});
		}

		for (const func of this.#onPageLoad) func(this);
	}

	/**
	 * Loads the given page. It clears the tab's history following the previously loaded tab's page and adds it to the history.
	 * @param {OpenSearchPage | UploadPage} page
	 */
	loadPage(page) {
		if (this.#page instanceof UploadPage) {
			this.#prevPages.push(new UploadPage());
		} else {
			this.#prevPages.push(this.#page.close());
		}
		this.#nextPages = [];

		this.#setPage(page);
	}

	/**
	 * Loads the the previous page in the tab history. This method should only be used if prevPages isn't empty.
	 */
	loadPrevPage() {
		if (this.#page instanceof UploadPage) {
			this.#nextPages.push(new UploadPage());
		} else {
			this.#nextPages.push(this.#page.close());
		}

		let prevPage = this.#prevPages.pop();
		//@ts-ignore
		if (prevPage instanceof ClosedSearchPage) prevPage = new OpenSearchPage(prevPage);

		// @ts-ignore
		this.#setPage(prevPage);
	}

	/**
	 * Loads the the next page in the tab history. This method should only be used if nextPages isn't empty.
	 */
	loadNextPage() {
		if (this.#page instanceof UploadPage) {
			this.#prevPages.push(new UploadPage());
		} else {
			this.#prevPages.push(this.#page.close());
		}

		let nextPage = this.#nextPages.pop();
		// @ts-ignore
		if (nextPage instanceof ClosedSearchPage) nextPage = new OpenSearchPage(nextPage);

		// @ts-ignore
		this.#setPage(nextPage);
	}

	/**
	 * Renders the current tab's page.
	 */
	render() {
		this.#renderedPage?.derender();
		this.#page.render();
		this.#renderedPage = this.#page;
	}

	/**
	 * Unrenders the tab's page.
	 */
	derender() {
		this.#page.derender();
	}

	/**
	 * Sets the given function to execute when the specified event is triggered. Functions will be given the tab as an argument.
	 * @param {"select"|"deselect"|"loadpage"} eventType
	 * @param {Function} callback
	 */
	addEventListener(eventType, callback) {
		if (eventType === 'select' && !this.#onSelect.includes(callback)) {
			this.#onSelect.push(callback);
		} else if (eventType === 'deselect' && !this.#onDeselect.includes(callback)) {
			this.#onDeselect.push(callback);
		} else if (eventType === 'loadpage' && !this.#onPageLoad.includes(callback)) {
			this.#onPageLoad.push(callback);
		}
	}

	/**
	 * Removes the event listener of the specified type with the specified function.
	 * @param {'select' | 'deselect' | 'loadpage'} eventType
	 * @param {Function} callback
	 */
	removeEventListener(eventType, callback) {
		let eventCallbacks;
		if (eventType === 'select') eventCallbacks = this.#onSelect;
		else if (eventType === 'deselect') eventCallbacks = this.#onDeselect;
		else if (eventType === 'loadpage') eventCallbacks = this.#onPageLoad;

		eventCallbacks.splice(
			eventCallbacks.findIndex((func) => func === callback),
			1,
		);
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
	 * If a previous page is currently loaded, returns the following pages.
	 */
	get nextPages() {
		return this.#nextPages;
	}
}

export default Tab;
