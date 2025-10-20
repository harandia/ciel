import ClosedAllImagesSearchPage from './closedAllImagesSearchPage.js';
import ClosedSearchPage from './closedSearchPage.js';
import TagAutocompleter from './components/autocompleter.js';
import SearchEditor from './components/editor/searchEditor.js';
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
	/** @type {SearchEditor} */
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
		this.#editor = new SearchEditor(pageFragment.querySelector('.editor'));

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
			const { showConfirmation } = await window.app.getSettings();

			if (showConfirmation && this.#editor.hasUnsavedChanges) {
				const choice = await window.app.showWarning('Warning', 'Are you sure you want to discard the changes?', ['Cancel', 'Yes, discard'], 0);

				if (choice === 0) {
					this._imageGrid.stopSelect();
					return;
				}
			}

			this.#editor.show(selection, await Promise.all(selection.map(async (image) => new Set(await window.app.getImageTags(image.path)))));
		});

		this._imageGrid.addEventListener('deselect', async (deselected) => {
			const selection = this._imageGrid.selectedImages;

			const { showConfirmation } = await window.app.getSettings();

			if (showConfirmation && this.#editor.hasUnsavedChanges) {
				const choice = await window.app.showWarning('Warning', 'Are you sure you want to discard the changes?', ['Cancel', 'Yes, discard'], 0);

				if (choice === 0) {
					this._imageGrid.stopDeselect();
					return;
				}
			}
			if (selection.length - deselected.length <= 0) {
				this.#editor.hide();
			} else if (selection.length - deselected.length > 0) {
				const newSelection = selection.filter(
					(selectedImage) => !deselected.some((deselectedImage) => selectedImage.element === deselectedImage.element),
				);
				this.#editor.show(newSelection, await Promise.all(newSelection.map(async (image) => new Set(await window.app.getImageTags(image.path)))));
			}
		});

		pageFragment.querySelector('.search-view').addEventListener('click', (event) => {
			if (
				!this._imageGrid.images.some((image) => event.composedPath().includes(image.element)) &&
				!event.composedPath().includes(document.querySelector('header'))
			) {
				this._imageGrid.deselect(this._imageGrid.images);
			}
		});

		this.#editor.addEventListener('delete', (deleted) => {
			for (const image of deleted) {
				this._imageGrid.removeImage(image);
			}

			const selection = this._imageGrid.selectedImages;

			if (selection.length <= 0) {
				this.#editor.hide();
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

	/**
	 * Return true if the page has some unsaved changes.
	 */
	get hasUnsavedChanges() {
		return this.#editor.hasUnsavedChanges;
	}
}

export default OpenSearchPage;
