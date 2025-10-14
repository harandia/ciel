import ClosedAllImagesSearchPage from './closedAllImagesSearchPage.js';
import ClosedSearchPage from './closedSearchPage.js';
import TagAutocompleter from './components/autocompleter.js';
import Editor from './components/editor.js';
import ImageGrid from './components/imageGrid.js';
import SearchBar from './components/searchbar.js';
import SearchPage from './searchPage.js';

/**
 * Represents an open SearchPage.
 * @class
 */
class OpenSearchPage extends SearchPage {
	/** @type {SearchBar} */
	#searchBar;
	/** @type {ImageGrid} */
	_imageGrid;
	/** @type {Editor} */
	#editor;
	/** @type {HTMLElement[]} */
	#elements;

	/** @type {Function[]}} */
	_onClose;
	/** @type {Function[]} */
	#onSearch;

	/**
	 * Returns the open version of the given closed page.
	 * @param {ClosedSearchPage} closedPage
	 * @returns {Promise<OpenSearchPage>}
	 */
	static async open(closedPage) {
		let openPage;
		if (closedPage instanceof ClosedAllImagesSearchPage) {
			const { AllImagesSearchPage } = await import('./allImagesSearchPage.js');
			return new AllImagesSearchPage();
		} else {
			openPage = new OpenSearchPage(closedPage.searchTags);
		}
		return openPage;
	}

	/** @param {string[] | Set<string>} [param]*/
	constructor(param) {
		if (param) {
			super(param);
		} else {
			super();
		}

		this._onClose = [];
		this.#onSearch = [];

		//@ts-ignore
		const pageFragment = document.getElementById('search-page').content.cloneNode(true);

		this.#elements = Array.from(pageFragment.children);

		const autocompleter = new TagAutocompleter(pageFragment.querySelector('header'));

		this.#searchBar = new SearchBar(pageFragment.querySelector('header'), autocompleter);
		this._imageGrid = new ImageGrid(pageFragment.querySelector('.image-grid'));
		this.#editor = new Editor(pageFragment.querySelector('.editor'));

		for (const tag of this.searchTags) {
			this.#searchBar.addTag(tag);
		}

		this.#searchBar.body.addEventListener('keydown', (event) => {
			// @ts-ignore
			switch (event.key) {
				case 'Enter':
					if (this.#searchBar.bodyText.length !== 0) {
						this.#searchBar.addTag(this.#searchBar.bodyText);
						this.#searchBar.clearInput();
					}
					setTimeout(() => {
						if (autocompleter.isHidden && !this.#searchBar.tags.some((tag) => tag.type === 'wrong')) {
							this.search();
						}
					}, 1);
			}
		});

		this.#searchBar.searchButton.addEventListener('click', () => {
			if (this.#searchBar.bodyText.length !== 0) {
				this.#searchBar.addTag(this.#searchBar.bodyText);
				this.#searchBar.clearInput();
			}
			setTimeout(() => {
				if (autocompleter.isHidden && !this.#searchBar.tags.some((tag) => tag.type === 'wrong')) {
					this.search();
				}
			}, 1);
		});

		const searchTags = this.searchTags.filter((tag) => !tag.startsWith('!'));
		const excludedTags = this.searchTags.filter((tag) => tag.startsWith('!')).map((tag) => tag.slice(1));
		window.app.searchImage(searchTags, excludedTags).then((images) => {
			this._imageGrid.showImages(images);
		});

		this._imageGrid.addEventListener('select', async (selection) => {
			if (selection.length === 0) {
				this.#editor.hide();
			} else {
				await this.#editor.show(selection);
			}
		});

		pageFragment.querySelector('.search-view').addEventListener('click', (event) => {
			if (
				!this._imageGrid.images.some((image) => event.composedPath().includes(image.element)) &&
				!event.composedPath().includes(this.#searchBar.body)
			) {
				for (let i = 0; i < this._imageGrid.imageCount; i++) {
					this._imageGrid.deselect(i);
				}
			}
		});

		this.#editor.addEventListener('delete', (deleted) => {
			for (const image of deleted) {
				this._imageGrid.deselect(image);
				this._imageGrid.removeImage(image);
			}
		});
	}

	/**
	 * Returns a new OpenSearchPage with the search bar's tags. There should not be any wrong tags.
	 * @returns {Promise<OpenSearchPage>}
	 */
	async search() {
		let newPage;
		if (this.#searchBar.tags.length === 0) {
			const { AllImagesSearchPage } = await import('./allImagesSearchPage.js');
			newPage = new AllImagesSearchPage();
		} else {
			const newTags = [];
			for (const tag of this.#searchBar.tags) {
				if (tag.type === 'excluded') {
					newTags.push('!' + tag.name);
				} else {
					newTags.push(tag.name);
				}
			}

			newPage = new OpenSearchPage(newTags);
		}

		for (const func of this.#onSearch) func(newPage);

		return newPage;
	}

	/**
	 * Returns the page closed as a ClosedSearchPage.
	 * @returns {ClosedSearchPage}
	 */
	close() {
		const closedPage = new ClosedSearchPage(this.searchTags);

		for (const func of this._onClose) func(closedPage);

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
		if (eventType === 'close' && !this._onClose.includes(callback)) {
			this._onClose.push(callback);
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
		if (eventType === 'close') eventCallbacks = this._onClose;
		else if (eventType === 'search') eventCallbacks = this.#onSearch;

		eventCallbacks.splice(
			eventCallbacks.findIndex((func) => func === callback),
			1,
		);
	}
}

export default OpenSearchPage;
