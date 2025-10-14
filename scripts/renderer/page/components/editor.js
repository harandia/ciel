import TagAutocompleter, { Autocompleter } from './autocompleter.js';
import ImageGridImage from './image.js';
import TagEditor from './tagEditor.js';

class Editor {
	/** @type {HTMLElement} */
	#element;

	/** @type {HTMLElement} */
	#preview;

	/** @type {HTMLElement} */
	#counter;

	/** @type {TagEditor} */
	#tagEditor;

	/** @type {HTMLElement} */
	#deleteButton;

	/** @type {HTMLElement} */
	#openButton;

	/** @type {HTMLElement} */
	#applyButton;

	/** @type {HTMLElement} */
	#discardButton;

	/** @type {ImageGridImage[]} */
	#selectedImages;

	/** @type {Function[]} */
	#ondelete = [];

	/** @type {Function[]} */
	#onapply = [];

	/** @type {Function[]} */
	#ondiscard = [];

	constructor(element) {
		this.#element = element;

		this.#preview = this.#element.querySelector('.editor-preview');

		this.#counter = this.#element.querySelector('.editor-selection-counter');

		this.#tagEditor = new TagEditor(this.#element, new TagAutocompleter(this.#element.querySelector('.editor-body')));

		this.#selectedImages = [];

		this.#deleteButton = element.querySelector('.editor-delete-button');

		this.#openButton = element.querySelector('.editor-open-button');

		this.#applyButton = element.querySelector('.editor-apply-button');

		this.#discardButton = element.querySelector('.editor-discard-button');

		this.#deleteButton.addEventListener('click', async () => {
			const deleted = await window.app.deleteImage(this.#selectedImages.map((image) => image.path));

			if (deleted) {
				const selected = this.#selectedImages;
				for (const func of this.#ondelete) func(this.#selectedImages);
			}
		});

		this.#openButton.addEventListener('click', () => {
			for (const image of this.#selectedImages) {
				window.app.openImage(image.path);
			}
		});

		this.#applyButton.addEventListener('click', () => {
			/** @type {{addedTags: string[], deletedTags: string[]}} */
			const changes = {
				addedTags: [],
				deletedTags: [],
			};

			for (const tag of this.#tagEditor.tags) {
				if (tag.type === 'deleted') {
					changes.deletedTags.push(tag.name);
				} else if (tag.type === 'newAdded' || tag.type === 'firstTime') {
					changes.addedTags.push(tag.name);
				}
			}

			for (const image of this.#selectedImages) {
				window.app.updateImage(image.path, changes);
			}

			this.show(this.#selectedImages);
		});

		this.#discardButton.addEventListener('click', () => {
			for (const tag of this.#tagEditor.tags) {
				if (tag.type === 'deleted') tag.type = 'normal';
				else if (tag.type === 'firstTime' || tag.type === 'newAdded') this.#tagEditor.removeTag(tag);
			}
		});
	}

	/**
	 * Shows the editor for the given selection of images.
	 * @param {ImageGridImage[]} selection
	 */
	async show(selection) {
		this.#selectedImages = selection;

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

		const selectionTags = await Promise.all(selection.map(async (image) => new Set(await window.app.getImageTags(image.path))));

		this.#element.classList.remove('editor-hidden');

		if (!this.#element.classList.contains('editor-hidden')) {
			this.#tagEditor.clearTags();
			this.#tagEditor.clearInput();

			let intersectTags = selectionTags[0];
			for (let i = 1; i < selectionTags.length; i++) {
				// @ts-ignore
				intersectTags = intersectTags.intersection(selectionTags[i]);
			}

			for (const tag of intersectTags) {
				this.#tagEditor.addExistingTag(tag);
			}
		}
	}

	/**
	 * Hides the editor.
	 */
	async hide() {
		this.#tagEditor.clearTags();
		this.#tagEditor.clearInput();

		this.#element.classList.add('editor-hidden');
	}

	/**
	 * Sets the given callback to be executed when the specified event is triggered.
	 * If eventType is 'delete', the functions will be given the deleted images.
	 * If eventType is 'apply-changes', the function will be given an object {image, newTags}.
	 * If eventType is 'discard-changes', the function will be given an object {image, discardedTags}.
	 * @param {'delete' | 'apply-changes' | 'discard-changes'} eventType
	 * @param {Function} callback
	 */
	addEventListener(eventType, callback) {
		switch (eventType) {
			case 'delete':
				this.#ondelete.push(callback);
			case 'apply-changes':
				this.#onapply.push(callback);
			case 'discard-changes':
				this.#ondiscard.push(callback);
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
	 * Returns true if the editor has some unapplied changes to images' tags.
	 * @returns {boolean}
	 */
	get hasUnsavedChanges() {
		return this.#tagEditor.tags.some((tag) => tag.type === 'deleted' || tag.type === 'firstTime' || tag.type === 'newAdded');
	}
}

export default Editor;
