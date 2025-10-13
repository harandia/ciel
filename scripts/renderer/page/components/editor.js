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
	#selectedImages;

	constructor(element) {
		this.#element = element;

		this.#preview = this.#element.querySelector('.editor-preview');

		this.#counter = this.#element.querySelector('.editor-selection-counter');

		this.#tagEditor = new TagEditor(this.#element, new TagAutocompleter(this.#element.querySelector('.editor-body')));
	}

	/**
	 * Shows the editor for the given selection of images.
	 * @param {ImageGridImage[]} selection
	 */
	async show(selection) {
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

		this.#tagEditor.clearTags();
		this.#tagEditor.clearInput();

		const selectionTags = await Promise.all(selection.map(async (image) => new Set(await window.app.getImageTags(image.path))));

		let intersectTags = selectionTags[0];
		for (let i = 1; i < selectionTags.length; i++) {
			// @ts-ignore
			intersectTags = intersectTags.intersection(selectionTags[i]);
		}

		for (const tag of intersectTags) {
			this.#tagEditor.addExistingTag(tag);
		}

		this.#element.classList.remove('editor-hidden');
	}

	hide() {
		setTimeout(() => {
			this.#element.classList.add('editor-hidden');
		});
	}

	/**
	 * Displays the images selected count.
	 * @param {number} count
	 */
	#showSelectedCount(count) {
		this.#counter.innerHTML = `<strong>${count}</strong> images are selected`;
		this.#counter.classList.remove('editor-selection-counter-hidden');
	}

	#hideSelectedCount() {
		this.#counter.classList.add('editor-selection-counter-hidden');
	}
}

export default Editor;
