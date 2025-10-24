import ClosedSearchPage from '../page/closedSearchPage.js';
import SearchPage from '../page/searchPage.js';
import Tag from '../tag.js';

class SubmenuTab {
	/**@type {Element} */
	#element;

	/**@type {Element} */
	#tagList;

	/**@type {Element} */
	#deleteButton;

	/**@type {SearchPage} */
	#page;

	/**@type {string} */
	#date;

	/**
	 * Builds a SubmenuTab object, date should be in the format 'dddd D, MMMM'.
	 * @param {SearchPage} page
	 * @param {string} date
	 */
	constructor(page, date) {
		// @ts-ignore
		const tabFragment = document.getElementById('submenu-tab').content.cloneNode(true);

		this.#element = tabFragment.querySelector('.submenu-tab');
		this.#tagList = tabFragment.querySelector('.submenu-tab-tag-list');
		this.#deleteButton = tabFragment.querySelector('.submenu-tab-delete-button');

		this.#page = page;
		this.#date = date;

		for (const tagName of this.#page.searchTags) {
			let type = 'normal';
			if (tagName.startsWith('!')) type = 'excluded';
			// @ts-ignore
			const tag = new Tag(tagName.replace(/^!+/, ''), type);

			this.#tagList.appendChild(tag.element);
		}
	}

	/**
	 * Returns true if the element is a SubmenuTab.
	 * @param {Element} element
	 * @returns {boolean}
	 */
	static isSubmenuTab(element) {
		return (
			element.classList.contains('submenu-tab') &&
			element.children.length === 2 &&
			element.children[0].classList.contains('submenu-tab-tag-list') &&
			element.children[1].classList.contains('submenu-tab-delete-button')
		);
	}

	/**
	 * Returns a new SubmenuTab built from a serialized object like the ones returned by the toJSON() method.
	 * @param {{page: {searchTags: string[]}, date: string}} json
	 * @returns {SubmenuTab}
	 */
	static fromJSON(json) {
		const { page, date } = json;
		return new SubmenuTab(ClosedSearchPage.fromJSON(page), date);
	}

	/**
	 * Returns a serializable object with the page and the date of the tab.
	 * @returns {{page: {searchTags: string[]}, date: string}}
	 */
	toJSON() {
		return { page: this.#page.toJSON(), date: this.#date };
	}

	/**
	 * Returns this submenuTab's element in the DOM.
	 * @returns {Element}
	 */
	get element() {
		return this.#element;
	}

	/**
	 *  Returns this submenuTab's delete button element in the DOM.
	 * @returns {Element}
	 */
	get deleteButton() {
		return this.#deleteButton;
	}

	/**
	 *  Returns this submenuTab's page.
	 * @returns {ClosedSearchPage}
	 */
	get page() {
		return this.#page;
	}

	/**
	 * Returns this tab's date of creation, in 'dddd, DD MMMM YYYY' format.
	 */
	get date() {
		return this.#date;
	}
}

export default SubmenuTab;
