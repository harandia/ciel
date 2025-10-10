import Tag from '../../tag.js';
import { Autocompleter } from './autocompleter.js';
import TagInput from './tagInput.js';

class SearchBar extends TagInput {
	#body;
	#searchButton;
	#warning;

	/**
	 * The element has the follow the scheme of a searchbar-container.
	 * @param {HTMLElement} element
	 * @param {Autocompleter} autocompleter
	 */
	constructor(element, autocompleter) {
		const body = element.querySelector('.searchbar-body');

		// @ts-ignore
		super(body, autocompleter);

		this.#body = body;
		this.#searchButton = element.querySelector('.searchbar-search-button');
		this.#warning = element.querySelector('.searchbar-warning');

		element.querySelector('.searchbar-clear-button').addEventListener('click', () => {
			this.tags.forEach((tag) => this.removeTag(tag));
			this._input.textContent = '';
		});

		this.#body.addEventListener('wheel', (event) => {
			// @ts-ignore
			this.#body.scrollLeft = this.#body.scrollLeft - event.deltaY;
		});
	}

	#updateSearchButton() {
		if (this.tags.length === 0) {
			this.#searchButton.classList.add('searchbar-search-button-disabled');
			return;
		}

		if (this.tags.some((tag) => tag.type === 'wrong')) {
			this.#searchButton.classList.add('searchbar-search-button-disabled');
			return;
		}

		this.#searchButton.classList.remove('searchbar-search-button-disabled');
	}

	/**
	 * Shows the wrong tag warning with the wrong tags.
	 */
	#updateWrongWarning() {
		const wrongTags = this.tags.filter((tag) => tag.type === 'wrong');

		if (wrongTags.length === 0) {
			this.#warning.classList.add('searchbar-warning-hidden');
			return;
		}

		let warning;

		if (wrongTags.length === 1) {
			warning = `${wrongTags[0].name} tag doesn't exists.`;
		} else {
			warning = `${wrongTags[0].name} tags don't exist`;
			for (let i = 1; i < wrongTags.length; i++) {
				warning = `${wrongTags[i].name}, ` + warning;
			}
		}

		this.#warning.textContent = warning;
		this.#warning.classList.remove('searchbar-warning-hidden');
	}

	/**
	 * Adds the given tag to the TagInput.
	 * @param {string} tag
	 */
	async addTag(tag) {
		let type;
		if (!(await window.app.existTag(tag))) {
			type = 'wrong';
		} else {
			type = 'normal';
		}
		// @ts-ignore
		const newTag = new Tag(tag, type);

		newTag.element.addEventListener('click', () => {
			this.removeTag(tag);
		});

		this._addTag(newTag);
		this.#updateWrongWarning();
		this.#updateSearchButton();
	}

	/**
	 * Deletes the first tag that is equal to the given tag if param is a Tag.
	 * Deletes the first tag with the specified name if param is a string.
	 * Deletes the tag in that specific position if param is a number.
	 * The positions go from 0 to tagCount - 1. Negative numbers are allowed and start from the last position.
	 * @param {number | Tag | string} param
	 * @returns {boolean}
	 */
	removeTag(param) {
		const children = this._elements;
		let isRemoved;
		if (typeof param === 'number') {
			if (param >= 0) {
				if (children[param]) {
					const removed = this._container.removeChild(children[param]);
					isRemoved = true;
				} else isRemoved = false;
			} else {
				if (children[children.length - 1 + param]) {
					const removed = this._container.removeChild(children[children.length - 1 + param]);
					isRemoved = true;
				} else isRemoved = false;
			}
		} else if (typeof param === 'string') {
			isRemoved = false;

			for (let i = 0; i < this.tagCount; i++) {
				// @ts-ignore
				if (Tag.fromElement(children[i]).name === param) {
					const removed = this._container.removeChild(children[i]);

					isRemoved = true;
				}
			}
		} else {
			isRemoved = false;

			for (let i = 0; i < this.tagCount; i++) {
				// @ts-ignore
				if (param.equals(Tag.fromElement(children[i]))) {
					const removed = this._container.removeChild(children[i]);
					isRemoved = true;
				}
			}
		}

		this.#updateWrongWarning();
		this.#updateSearchButton();

		return isRemoved;
	}

	/**
	 * Clears the input's text.
	 */
	clearInput() {
		this._input.textContent = '';
	}

	/**
	 * Returns the element of the body of the search bar.
	 * @returns {Element}
	 */
	get body() {
		return this.#body;
	}

	/**
	 * Returns the element of the search button associated with the search bar.
	 * @returns {Element}
	 */
	get searchButton() {
		return this.#searchButton;
	}

	/**
	 * Returns the current text of the body (only the plain text of the input not the tags).
	 */
	get bodyText() {
		return this._input.textContent;
	}
}

export default SearchBar;
