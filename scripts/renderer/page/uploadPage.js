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

		this.#addButton.addEventListener('click', async (event) => {
			const files = await window.app.openFileDialog();

			if (files) {
				const downloads = [];
				for (const file of files) {
					const download = await window.app.downloadImage(file);
					this.#uploads.push({ image: download, tags: [] });
					this.#imageGrid.addImages(download);
				}
			}
		});

		for (const element of this.#elements) {
			/**
			 * Adds the images stored in the dataTransfer. If no image is given or other types of data are given, it won't do anything.
			 * @param {DataTransfer} dataTransfer
			 */
			const dataTransferHandle = async (dataTransfer) => {
				const downloads = [];

				const files = dataTransfer.files;
				if (files.length !== 0) {
					for (let i = 0; i < files.length; i++) {
						const path = await window.app.getFilePath(files[i]);
						let download;
						if (path) {
							download = await window.app.downloadImage(path);
						} else {
							download = await window.app.downloadCopiedImage();
						}

						this.#uploads.push({ image: download, tags: [] });
						this.#imageGrid.addImages(download);
					}
				} else if (dataTransfer.types.includes('text/uri-list')) {
					const uriString = dataTransfer.getData('text/uri-list');
					const urls = uriString.split('\r\n').filter((url) => !url.startsWith('#'));
					for (const url of urls) {
						const download = await window.app.downloadImage(url);
						this.#uploads.push({ image: download, tags: [] });
						this.#imageGrid.addImages(download);
					}
				} else if (dataTransfer.types.includes('text/plain')) {
					const str = dataTransfer.getData('text/plain');
					const download = await window.app.downloadImage(str);
					this.#uploads.push({ image: download, tags: [] });
					this.#imageGrid.addImages(download);
				}
			};

			element.addEventListener('dragover', (event) => {
				event.preventDefault();
			});

			element.addEventListener('drop', async (event) => {
				event.preventDefault();

				dataTransferHandle(event.dataTransfer);
			});

			element.addEventListener('paste', (event) => {
				event.preventDefault();

				dataTransferHandle(event.clipboardData);
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
