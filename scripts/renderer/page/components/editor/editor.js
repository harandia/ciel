import Tag from '../../../tag.js';
import TagAutocompleter from '../autocompleter.js';
import ImageGridImage from '../image.js';
import SearchTagEditor from './searchTagEditor.js';
import UploadTagEditor from './uploadTagEditor.js';

/**
 * @class
 * @abstract
 */
class Editor {
	/** @type {HTMLElement} */
	_element;

	/** @type {HTMLElement} */
	#preview;

	/** @type {HTMLElement} */
	#counter;

	/** @type {SearchTagEditor | UploadTagEditor} */
	_tagEditor;

	/** @type {HTMLElement} */
	#deleteButton;

	/** @type {HTMLElement} */
	_openButton;

	/** @type {ImageGridImage[]} */
	_selectedImages;

	/** @type {Function[]} */
	#ondelete = [];

	/** @type {Function[]} */
	#onshow = [];

	/** @type {Function[]} */
	#onhide = [];

	constructor(element) {
		this._element = element;

		this.#preview = this._element.querySelector('.editor-preview');

		this.#counter = this._element.querySelector('.editor-selection-counter');

		this._selectedImages = [];

		this.#deleteButton = element.querySelector('.editor-delete-button');

		this._openButton = element.querySelector('.editor-open-button');

		this.#deleteButton.addEventListener('click', async () => {
			const deleted = await window.app.deleteImage(this._selectedImages.map((image) => image.path));

			if (deleted) {
				const selected = this._selectedImages;
				for (const func of this.#ondelete) func(this._selectedImages);
			}
		});

		this._openButton.addEventListener('click', () => {
			for (const image of this._selectedImages) {
				window.app.openImage(image.path);
			}
		});
	}

	/**
	 * Shows the editor for the given selection of images.
	 * @param {ImageGridImage[]} selection
	 * @param {Set<string>[]} tags
	 */
	show(selection, tags) {
		this._selectedImages = selection;

		if (selection.length > 1) {
			this.#preview.classList.add('editor-multi-preview');
			this.#showSelectedCount(selection.length);
		} else {
			this.#preview.classList.remove('editor-multi-preview');
			this.#hideSelectedCount();
		}

		const previewImage = this.#preview.querySelector('img');
		if (!selection.some((image) => image.path === previewImage.src)) {
			previewImage.src = selection[0].path;
		}

		this._tagEditor.clearTags();
		this._tagEditor.clearInput();

		this._element.classList.remove('editor-hidden');

		if (!this._element.classList.contains('editor-hidden')) {
			if (tags[0]) {
				let intersectTags = tags[0];
				for (let i = 1; i < tags.length; i++) {
					// @ts-ignore
					intersectTags = intersectTags.intersection(tags[i]);
				}

				this._addSelectionTags(intersectTags);
			}
			this._openButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
		}

		for (const func of this.#onshow) func({ selection: selection, tags: this._tagEditor.tags });
	}

	/**
	 * Adds the already assigned tags of the selection to the editor.
	 * @param {Set<string>} tags
	 * @abstract
	 */
	async _addSelectionTags(tags) {}

	/**
	 * Hides the editor.
	 */
	hide() {
		if (!this.isHidden) {
			for (const func of this.#onhide) func({ selection: this._selectedImages, tags: this._tagEditor.tags });

			this._tagEditor.clearTags();
			this._tagEditor.clearInput();

			this._element.classList.add('editor-hidden');
		}
	}

	/**
	 * Sets the given callback to be executed when the specified event is triggered.
	 * If eventType is 'delete', the functions will be given the deleted images.
	 * If eventType is 'show', the function will be given an object {selection: ImageGridImage[], tags: Tag[]} with the images
	 * and tags that are going to be displayed.
	 * If eventType is 'hide', the function will be given an object {selection: ImageGridImage[], tags: Tag[]} with the images
	 * and tags that were displayed.
	 * @param {'delete' | 'show' | 'hide'} eventType
	 * @param {Function} callback
	 */
	addEventListener(eventType, callback) {
		switch (eventType) {
			case 'delete':
				this.#ondelete.push(callback);
				break;
			case 'show':
				this.#onshow.push(callback);
				break;
			case 'hide':
				this.#onhide.push(callback);
				break;
		}
	}

	/**
	 * Displays the images selected count.
	 * @param {number} count
	 */
	#showSelectedCount(count) {
		this.#counter.innerHTML = `<strong>${count}</strong> images are selected`;
		this.#counter.classList.remove('editor-selection-counter-hidden');
	}

	/**
	 * Hides the images selected count;
	 */
	#hideSelectedCount() {
		this.#counter.classList.add('editor-selection-counter-hidden');
	}

	/**
	 * Returns this editor's current tags.
	 * @returns {Tag[]}
	 */
	get tags() {
		return this._tagEditor.tags;
	}

	/**
	 * Returns true if the element is hidden.
	 * @returns {boolean}
	 */
	get isHidden() {
		return this._element.classList.contains('editor-hidden');
	}
}

export default Editor;
