import Editor from './components/editor.js';
import ImageGrid from './components/imageGrid.js';

class UploadPage {
	/** @type {ImageGrid} */
	#imageGrid;

	/** @type {Element} */
	#addButton;

	/** @type {Editor} */
	#editor;

	/** @type {HTMLElement[]} */
	#elements;

	/**@type {{image: string, tags: string[]}[]} */
	#uploads = [];

	constructor() {
		//@ts-ignore
		const pageFragment = document.getElementById('upload-page').content.cloneNode(true);

		this.#elements = Array.from(pageFragment.children);

		this.#imageGrid = new ImageGrid(pageFragment.querySelector('.image-grid'));

		this.#addButton = pageFragment.querySelector('.upload-add-button');
		// this.#editor = new Editor(pageFragment.querySelector('.editor'));

		for (const element of this.#elements) {
			element.addEventListener('dragover', (event) => {
				event.preventDefault();
			});

			element.addEventListener('drop', async (event) => {
				event.preventDefault();

				const downloads = [];

				const files = event.dataTransfer.files;
				if (files.length !== 0) {
					for (let i = 0; i < files.length; i++) {
						const download = await window.app.downloadImage(await window.app.getFilePath(files[i]));
						this.#uploads.push({ image: download, tags: [] });
						this.#imageGrid.addImages(download);
					}
				} else if (event.dataTransfer.types.includes('text/uri-list')) {
					const uriString = event.dataTransfer.getData('text/uri-list');
					const urls = uriString.split('\r\n').filter((url) => !url.startsWith('#'));
					for (const url of urls) {
						const download = await window.app.downloadImage(url);
						this.#uploads.push({ image: download, tags: [] });
						this.#imageGrid.addImages(download);
					}
				}
			});
		}

		pageFragment.querySelector('.upload-view').addEventListener('click', (event) => {
			if (
				!this.#imageGrid.images.some((image) => event.composedPath().includes(image.element)) &&
				!event.composedPath().includes(document.querySelector('.upload-add-button')) &&
				!event.composedPath().includes(document.querySelector('footer'))
			) {
				this.#imageGrid.deselect(this.#imageGrid.images);
			}
		});
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

	addEventListener(eventType, callback) {}

	removeEventListener(eventType, callback) {}

	/**
	 * Return true if the page has some unsaved changes.
	 */
	get hasUnsavedChanges() {
		return this.#uploads.length !== 0;
	}

	/**
	 * Returns the uploaded images and their tags.
	 */
	get uploads() {
		return this.#uploads;
	}
}

export default UploadPage;
