import TagAutocompleter, { Autocompleter } from '../autocompleter.js';
import ImageGridImage from '../image.js';
import Editor from './editor.js';
import SearchTagEditor from './searchTagEditor.js';

/**
 * @class
 */
class SearchEditor extends Editor {
	/** @type {HTMLElement} */
	#applyButton;

	/** @type {HTMLElement} */
	#discardButton;

	/** @type {Function[]} */
	#onapply = [];

	/** @type {Function[]} */
	#ondiscard = [];

	constructor(element) {
		super(element);

		this._tagEditor = new SearchTagEditor(element, new TagAutocompleter(element.querySelector('.editor-body')));

		this.#applyButton = element.querySelector('.editor-apply-button');

		this.#discardButton = element.querySelector('.editor-discard-button');

		this.#applyButton.addEventListener('click', async () => {
			/** @type {{addedTags: string[], deletedTags: string[]}} */
			const changes = {
				addedTags: [],
				deletedTags: [],
			};

			for (const tag of this._tagEditor.tags) {
				if (tag.type === 'deleted') {
					changes.deletedTags.push(tag.name);
				} else if (tag.type === 'newAdded' || tag.type === 'firstTime') {
					changes.addedTags.push(tag.name);
				}
			}

			for (const image of this._selectedImages) {
				window.app.updateImage(image.path, changes);
			}

			this.show(
				this._selectedImages,
				await Promise.all(this._selectedImages.map(async (image) => new Set(await window.app.getImageTags(image.path)))),
			);
		});

		this.#discardButton.addEventListener('click', () => {
			for (const tag of this._tagEditor.tags) {
				if (tag.type === 'deleted') tag.type = 'normal';
				else if (tag.type === 'firstTime' || tag.type === 'newAdded') this._tagEditor.removeTag(tag);
			}
		});
	}

	async _addSelectionTags(tags) {
		for (const tag of tags) {
			this._tagEditor.addExistingTag(tag);
		}
	}

	/**
	 * Sets the given callback to be executed when the specified event is triggered.
	 * If eventType is 'delete', the functions will be given the deleted images.
	 * If eventType is 'show', the function will be given an object {selection: ImageGridImage[], tags: Tag[]} with the images
	 * and tags that are going to be displayed.
	 * If eventType is 'hide', the function will be given an object {selection: ImageGridImage[], tags: Tag[]} with the images
	 * and tags that were displayed.
	 * If eventType is 'apply-changes', the function will be given an object {image, newTags}.
	 * If eventType is 'discard-changes', the function will be given an object {image, discardedTags}.
	 * @param {'delete' | 'apply-changes' | 'discard-changes' | 'show' | 'hide'} eventType
	 * @param {Function} callback
	 */
	addEventListener(eventType, callback) {
		switch (eventType) {
			case 'apply-changes':
				this.#onapply.push(callback);
				break;
			case 'discard-changes':
				this.#ondiscard.push(callback);
				break;
			default:
				super.addEventListener(eventType, callback);
				break;
		}
	}

	/**
	 * Returns true if the editor has some unapplied changes to images' tags.
	 * @returns {boolean}
	 */
	get hasUnsavedChanges() {
		return this._tagEditor.tags.some((tag) => tag.type === 'deleted' || tag.type === 'firstTime' || tag.type === 'newAdded');
	}
}

export default SearchEditor;
