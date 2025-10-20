import SearchEditor from './components/editor/searchEditor.js';
import UploadEditor from './components/editor/uploadEditor.js';
import ImageGrid from './components/imageGrid.js';

class UploadPage {
	/** @type {ImageGrid} */
	#imageGrid;

	/** @type {Element} */
	#addButton;

	/** @type {Element} */
	#cancelButton;

	/** @type {Element} */
	#uploadButton;

	/** @type {UploadEditor} */
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

		this.#cancelButton = pageFragment.querySelector('.upload-cancel-button');

		this.#uploadButton = pageFragment.querySelector('.upload-upload-button');

		this.#editor = new UploadEditor(pageFragment.querySelector('.editor'));

		this.#editor.addEventListener('hide', async ({ selection, tags }) => {
			const uploadSelection = [];
			const imagesUpload = {};

			for (const image of selection) {
				for (const upload of this.#uploads) {
					if ((await window.app.fileURLToPath(image.path)) === upload.image) {
						imagesUpload[image.path] = upload;
						uploadSelection.push(upload);
						break;
					}
				}
			}

			if (uploadSelection.length !== 0) {
				const initialTags = Array.from(uploadSelection[0].tags);
				for (let i = 1; i < uploadSelection.length; i++) {
					for (const tag of initialTags) {
						if (!uploadSelection[i].tags.includes(tag)) {
							const removeIndex = initialTags.findIndex((initialTag) => initialTag === tag);
							initialTags.splice(removeIndex, 1);
						}
					}
				}

				const newTags = tags.map((tag) => tag.name);

				for (const tag of initialTags) {
					if (!newTags.includes(tag)) {
						for (const upload of uploadSelection) {
							const removeIndex = upload.tags.findIndex((initialTag) => initialTag === tag);
							upload.tags.splice(removeIndex, 1);
						}
					}
				}

				for (const tag of newTags) {
					if (!initialTags.includes(tag)) {
						for (const upload of uploadSelection) {
							upload.tags.push(tag);
						}
					}
				}

				for (const selected of selection) {
					if (imagesUpload[selected.path].tags.length === 0) {
						selected.showNewIcon();
					} else {
						selected.hideNewIcon();
					}
				}
			}
		});

		this.#imageGrid.addEventListener('select', async (selection) => {
			const tags = [];
			for (const upload of this.#uploads) {
				for (const image of selection) {
					if ((await window.app.fileURLToPath(image.path)) === upload.image) {
						tags.push(new Set(upload.tags));
					}
				}
			}

			this.#editor.show(selection, tags);
		});

		this.#imageGrid.addEventListener('deselect', async (deselected) => {
			const selection = this.#imageGrid.selectedImages;

			if (selection.length - deselected.length <= 0) {
				this.#editor.hide();
			} else if (selection.length - deselected.length > 0) {
				const newSelection = selection.filter(
					(selectedImage) => !deselected.some((deselectedImage) => selectedImage.element === deselectedImage.element),
				);

				const tags = [];
				for (const upload of this.#uploads) {
					for (const image of selection) {
						if ((await window.app.fileURLToPath(image.path)) === upload.image) {
							tags.push(new Set(upload.tags));
						}
					}
				}

				this.#editor.show(newSelection, tags);
			}
		});

		this.#addButton.addEventListener('click', async (event) => {
			const files = await window.app.openFileDialog();

			if (files) {
				const downloads = [];
				for (const file of files) {
					const download = await window.app.downloadImage(file);
					this.#uploads.push({ image: download, tags: [] });
					const image = this.#imageGrid.addImages(download);
					image.showNewIcon();
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
						const image = this.#imageGrid.addImages(download);
						image.showNewIcon();
					}
				} else if (dataTransfer.types.includes('text/uri-list')) {
					const uriString = dataTransfer.getData('text/uri-list');
					const urls = uriString.split('\r\n').filter((url) => !url.startsWith('#'));
					for (const url of urls) {
						const download = await window.app.downloadImage(url);
						this.#uploads.push({ image: download, tags: [] });
						const image = this.#imageGrid.addImages(download);
						image.showNewIcon();
					}
				} else if (dataTransfer.types.includes('text/plain')) {
					const str = dataTransfer.getData('text/plain');
					const download = await window.app.downloadImage(str);
					this.#uploads.push({ image: download, tags: [] });
					const image = this.#imageGrid.addImages(download);
					image.showNewIcon();
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

		this.#editor.addEventListener('delete', async (deleted) => {
			for (const image of deleted) {
				await this.#imageGrid.removeImage(image);
			}

			const selection = this.#imageGrid.selectedImages;

			if (selection.length <= 0) {
				this.#editor.hide();
			}
		});

		this.#imageGrid.addEventListener('delete', async (deleted) => {
			let uploadIndex;
			for (let i = 0; i < this.#uploads.length; i++) {
				if (this.#uploads[i].image === (await window.app.fileURLToPath(deleted.path))) {
					uploadIndex = i;
					break;
				}
			}
			if (uploadIndex !== undefined) this.#uploads.splice(uploadIndex, 1);
		});

		this.#cancelButton.addEventListener('click', async () => {
			const { showConfirmation } = await window.app.getSettings();

			let choice;

			if (showConfirmation) {
				choice = await window.app.showWarning('Warning', 'Are you sure you want to discard the uploaded images?', ['Cancel', 'Yes, discard'], 0);
			}

			if (!showConfirmation || (showConfirmation && choice === 1)) {
				for (const image of this.#imageGrid.images) {
					await this.#imageGrid.removeImage(image);
					await window.app.deleteImage(image.path, true);
				}
			}
		});

		this.#uploadButton.addEventListener('click', async () => {
			let choice;

			if (this.#uploads.some((upload) => upload.tags.length === 0)) {
				choice = await window.app.showWarning('Warning', 'There are some images with no tags. Do you want to continue?', ['No, cancel', 'Yes'], 0);
			}

			if (choice === undefined || choice === 1) {
				for (const { image, tags } of this.#uploads) {
					window.app.registerImage(image, tags);
				}

				this.#uploads = [];
				for (const image of this.#imageGrid.images) {
					this.#imageGrid.removeImage(image);
				}
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
