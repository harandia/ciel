import TagAutocompleter from '../autocompleter.js';
import Editor from './editor.js';
import UploadTagEditor from './uploadTagEditor.js';

class UploadEditor extends Editor {
	/**@type {Function[]} */
	#ontagAdded;

	/**@type {Function[]} */
	#ontagDeleted;

	constructor(element) {
		super(element);

		this._tagEditor = new UploadTagEditor(element, new TagAutocompleter(element.querySelector('.editor-body')));
	}

	async _addSelectionTags(tags) {
		for (const tag of tags) {
			this._tagEditor.addTag(tag);
		}
	}

	/**
	 * Sets the given callback to be executed when the specified event is triggered.
	 * If eventType is 'delete', the functions will be given the deleted images.
	 * If eventType is 'show', the function will be given an object {selection: ImageGridImage[], tags: Tag[]} with the images
	 * and tags that are going to be displayed.
	 * If eventType is 'hide' no parameters will be given.
	 * @param {'delete' | 'show' | 'hide' | 'tag-added' | 'tag-deleted'} eventType
	 * @param {Function} callback
	 */
	addEventListener(eventType, callback) {
		switch (eventType) {
			case 'tag-added':
				this.#ontagAdded.push(callback);
				break;
			case 'tag-deleted':
				this.#ontagDeleted.push(callback);
				break;
			default:
				super.addEventListener(eventType, callback);
				break;
		}
	}
}

export default UploadEditor;
