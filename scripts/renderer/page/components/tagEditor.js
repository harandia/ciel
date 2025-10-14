import Tag from '../../tag.js';
import { Autocompleter } from './autocompleter.js';
import TagInput from './tagInput.js';

class TagEditor extends TagInput {
	_autocompleterOffsetX = -10;
	_autocompleterOffsetY = 20;

	#body;

	#warning;

	/**
	 * The element has the follow the scheme of a searchbar-container.
	 * @param {HTMLElement} editor
	 * @param {Autocompleter} autocompleter
	 */
	constructor(editor, autocompleter) {
		const body = editor.querySelector('.editor-body');

		// @ts-ignore
		super(body.querySelector('.tag-editor'), autocompleter);

		this.#body = body;
		this.#warning = body.querySelector('.tag-editor-warning');
	}

	/**
	 * Shows the wrong tag warning with the wrong tags.
	 */
	#updateFirstTimeWarning() {
		const firstTimeTags = this.tags.filter((tag) => tag.type === 'firstTime');

		if (firstTimeTags.length === 0) {
			// @ts-ignore
			this.#warning.style.maxHeight = 0;
			this.#warning.classList.add('tag-editor-warning-hidden');
			return;
		}

		let warning;

		if (firstTimeTags.length === 1) {
			warning = `${firstTimeTags[0].name} tag is going to be used for the first time.`;
		} else {
			warning = `${firstTimeTags[0].name} tags are going to be used for the first time.`;
			for (let i = 1; i < firstTimeTags.length; i++) {
				warning = `${firstTimeTags[i].name}, ` + warning;
			}
		}

		this.#warning.textContent = warning;

		// @ts-ignore
		this.#warning.style.maxHeight = this.#warning.scrollHeight + 'px';

		this.#warning.classList.remove('tag-editor-warning-hidden');
	}

	/**
	 * Adds a tag to the editor that is already attached to the image.
	 * @param {string} tag
	 */
	addExistingTag(tag) {
		const newTag = new Tag(tag);

		newTag.element.addEventListener('click', () => {
			this.removeTag(newTag);
		});

		this._addTag(newTag);

		this.#updateFirstTimeWarning();
	}

	/**
	 * Adds the given tag to the TagInput.
	 * @param {string} tag
	 */
	async addTag(tag) {
		let type = 'newAdded';
		if (tag.startsWith('!')) {
			tag = tag.slice(1);
		}

		if (!(await window.app.existTag(tag))) {
			type = 'firstTime';
		}

		// @ts-ignore
		const newTag = new Tag(tag, type);

		newTag.element.addEventListener('click', () => {
			this.removeTag(newTag);
		});

		this._addTag(newTag);
		this.#updateFirstTimeWarning();
	}

	/**
	 * If the tag is already deleted it will undelete it.
	 * Deletes the first tag that is equal to the given tag if param is a Tag.
	 * Deletes the first tag with the specified name if param is a string.
	 * Deletes the tag in that specific position if param is a number.
	 * The positions go from 0 to tagCount - 1. Negative numbers are allowed and start from the last position.
	 * @param {number | Tag} param
	 * @returns {boolean}
	 */
	removeTag(param) {
		const children = this._tagElements;
		let isRemoved;
		if (typeof param === 'number') {
			if (param >= 0) {
				if (children[param]) {
					// @ts-ignore
					const tag = Tag.fromElement(children[param]);
					if (tag.type === 'normal') {
						tag.type = 'deleted';
					} else if (tag.type === 'deleted') {
						tag.type = 'normal';
					} else {
						this._container.removeChild(children[param]);
					}

					isRemoved = true;
				} else isRemoved = false;
			} else {
				if (children[children.length - 1 + param]) {
					// @ts-ignore
					const tag = Tag.fromElement(children[children.length - 1 + param]);
					if (tag.type === 'normal') {
						tag.type = 'deleted';
					} else if (tag.type === 'deleted') {
						tag.type = 'normal';
					} else {
						this._container.removeChild(children[children.length - 1 + param]);
					}

					isRemoved = true;
				} else isRemoved = false;
			}
		} else {
			isRemoved = false;

			for (let i = 0; i < this.tagCount; i++) {
				// @ts-ignore
				if (param.equals(Tag.fromElement(children[i]))) {
					// @ts-ignore
					const tag = Tag.fromElement(children[i]);
					if (tag.type === 'normal') {
						tag.type = 'deleted';
					} else if (tag.type === 'deleted') {
						tag.type = 'normal';
					} else {
						this._container.removeChild(children[i]);
					}

					isRemoved = true;
					break;
				}
			}
		}

		this.#updateFirstTimeWarning();

		return isRemoved;
	}

	/**
	 * Clears the input's text.
	 */
	clearInput() {
		this._input.textContent = '';
	}

	clearTags() {
		for (const tag of this.tags) {
			this._container.removeChild(tag.element);
		}
	}

	/**
	 * Returns the current text of the body (only the plain text of the input not the tags).
	 */
	get bodyText() {
		return this._input.textContent;
	}
}

export default TagEditor;
