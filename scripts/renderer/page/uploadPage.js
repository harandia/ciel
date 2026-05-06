import ContextMenu from '../contextMenu.js';
import keysDown from '../general.js';
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

	/**@type {Map<string, string[]>} */
	#uploads = new Map();

	/**@type {({item: string, click: ()=>any, disabled?: boolean} | 'separator')[]} */
	#contextMenu;

	constructor() {
		//@ts-ignore
		const pageFragment = document.getElementById('upload-page').content.cloneNode(true);

		this.#elements = Array.from(pageFragment.children);

		this.#imageGrid = new ImageGrid(pageFragment.querySelector('.image-grid'));

		this.#addButton = pageFragment.querySelector('.upload-add-button');

		this.#cancelButton = pageFragment.querySelector('.upload-cancel-button');

		this.#uploadButton = pageFragment.querySelector('.upload-upload-button');

		this.#editor = new UploadEditor(pageFragment.querySelector('.editor'));

		this.#editor.addEventListener('tags-changed', async (tags) => {
			const uploadSelection = [];
			const imagesUpload = {};

			const selection = this.#imageGrid.selectedImages;

			for (const image of selection) {
				const imgpath = image.path;
				const upload = { image: imgpath, tags: this.#uploads.get(imgpath) };

				imagesUpload[image.path] = upload;
				uploadSelection.push(upload);
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
			for (const image of selection) {
				console.log(image.path);
				tags.push(new Set(this.#uploads.get(image.path)));
			}

			this.#editor.show(selection, tags);
		});

		this.#imageGrid.addEventListener('deselect', async (deselected) => {
			const selection = this.#imageGrid.selectedImages;

			if (selection.length - deselected.length <= 0) {
				await this.#editor.hide();
			} else if (selection.length - deselected.length > 0) {
				const newSelection = selection.filter(
					(selectedImage) => !deselected.some((deselectedImage) => selectedImage.element === deselectedImage.element),
				);

				const tags = [];
				for (const image of newSelection) {
					tags.push(new Set(this.#uploads.get(image.path)));
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
					this.#uploads.set(download, []);
					const image = await this.#imageGrid.addImages(download, true);
					image.showNewIcon();
				}
			}
		});

		for (const element of this.#elements) {
			element.addEventListener('dragover', (event) => {
				event.preventDefault();
			});

			element.addEventListener('drop', async (event) => {
				event.preventDefault();

				this.#dataTransferHandle(event.dataTransfer);
			});
		}

		pageFragment.querySelector('.upload-view').addEventListener('click', (event) => {
			if (!this.#imageGrid.images.some((image) => event.composedPath().includes(image.element))) {
				this.#imageGrid.deselect(this.#imageGrid.images);
			}
		});

		this.#editor.addEventListener('delete', async (deleted) => {
			for (const image of deleted) {
				await this.#imageGrid.removeImage(image, true);
			}
			setTimeout(() => {
				this.#imageGrid.updateLayout();
			}, 100);

			const selection = this.#imageGrid.selectedImages;

			if (selection.length <= 0) {
				await this.#editor.hide();
			}
		});

		this.#imageGrid.addEventListener('delete', async (deleted) => {
			this.#uploads.delete(deleted.path);
		});

		this.#cancelButton.addEventListener('click', async () => {
			const { showConfirmation } = await window.app.getSettings();

			let choice;

			if (showConfirmation) {
				choice = await window.app.showWarning('Warning', 'Are you sure you want to discard the uploaded images?', ['Cancel', 'Yes, discard'], 0);
			}

			if (!showConfirmation || (showConfirmation && choice === 1)) {
				const imgToRemove = [...this.#imageGrid.images];

				this.mainPage.scrollTo({ top: 0 });
				setTimeout(async () => {
					for (let i = 0; i < imgToRemove.length; i++) {
						const image = imgToRemove[i];
						await this.#imageGrid.removeImage(image, true);
						await window.app.deleteImage(image.path, true);
					}
					setTimeout(() => {
						this.#imageGrid.updateLayout();
					}, 100);
				}, 100);
			}
		});

		this.#uploadButton.addEventListener('click', async () => {
			setTimeout(async () => {
				const { showConfirmation } = await window.app.getSettings();

				let choice;

				const interval = setInterval(async () => {
					if (this.#editor.isHidden) {
						clearInterval(interval);

						let someEmpty = false;
						for (const tags of this.#uploads.values()) {
							if (tags.length === 0) {
								someEmpty = true;
								break;
							}
						}
						if (showConfirmation && someEmpty) {
							choice = await window.app.showWarning('Warning', 'There some images with no tags. Do you want to continue?', ['No', 'Yes'], 0);
						}

						if (choice === undefined || !showConfirmation || (showConfirmation && choice === 1)) {
							for (const entry of this.#uploads) {
								window.app.registerImage(entry[0], entry[1]);
							}

							this.#uploads.clear();
							for (const image of this.#imageGrid.images) {
								await this.#imageGrid.removeImage(image, true);
							}

							setTimeout(() => {
								this.#imageGrid.updateLayout();
							}, 100);
						}
					}
				}, 100);
			}, 10);
		});

		this.#contextMenu = [];
		this.#contextMenu.push({ item: 'placeholder', click: () => undefined });

		this.mainPage.addEventListener('contextmenu', (event) => {
			// @ts-ignore
			if (event.target === this.mainPage || this.mainPageElements.includes(event.target)) {
				const firstItem = {};
				console.log(this.#imageGrid.imageCount);
				if (this.#imageGrid.selectedImages.length === this.#imageGrid.imageCount && this.#imageGrid.selectedImages.length !== 0) {
					firstItem.item = 'Deselect all';
					firstItem.click = () => this.#imageGrid.deselect(this.#imageGrid.images);
				} else {
					firstItem.item = 'Select all';
					firstItem.click = () => this.#imageGrid.select(this.#imageGrid.images);

					if (this.#imageGrid.imageCount === 0) {
						firstItem.disabled = true;
					} else {
						firstItem.disabled = false;
					}
				}

				// @ts-ignore
				this.#contextMenu.splice(0, 1, firstItem);

				// @ts-ignore
				ContextMenu.show(event.clientX, event.clientY, this.#contextMenu);
			}
		});

		this.mainPage.addEventListener('scroll', (event) => {
			this.#imageGrid.updateLayout(this.mainPage.scrollTop);
		});

		this.mainPage.addEventListener('resize', (event) => {
			this.#imageGrid.updateLayout();
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

		document.addEventListener('paste', this.#pasteHandle);
		document.addEventListener('keydown', this.#selectAllHandle);

		this.#imageGrid.updateLayout();
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
		document.removeEventListener('paste', this.#pasteHandle);
		document.removeEventListener('keydown', this.#selectAllHandle);
	}

	/**
	 * Adds the given options to the page's context menu.
	 * @param {({item: string, click: ()=>any, disabled?: boolean} | 'separator')[]} options
	 */
	addPageMenuOptions(options) {
		this.#contextMenu.push(...options);
	}

	/**
	 * Adds the images stored in the dataTransfer. If no image is given or other types of data are given, it won't do anything.
	 * @param {DataTransfer} dataTransfer
	 */
	#dataTransferHandle = async (dataTransfer) => {
		const downloads = [];

		const files = dataTransfer.files;
		const items = dataTransfer.items;

		const types = Array.from(dataTransfer.types);

		console.log(files);
		console.log(dataTransfer.getData('text/html'));
		console.log(dataTransfer.getData('text/uri-list'));
		console.log(dataTransfer.getData('text/plain'));

		if (dataTransfer.types.includes('text/uri-list')) {
			const uriString = dataTransfer.getData('text/uri-list');
			const urls = uriString.split('\r\n').filter((url) => !url.startsWith('#'));
			for (const url of urls) {
				const download = await window.app.downloadImage(url);
				this.#uploads.set(download, []);
				const image = await this.#imageGrid.addImages(download, true);
				image.showNewIcon();
			}
		} else if (dataTransfer.types.includes('text/plain')) {
			const str = dataTransfer.getData('text/plain');
			const download = await window.app.downloadImage(str);
			this.#uploads.set(download, []);
			const image = await this.#imageGrid.addImages(download, true);
			image.showNewIcon();
		} else if (types.includes('text/html')) {
			const html = dataTransfer.getData('text/html');
			const imgMatch = html.match(/<img[^>]+src=["'](.+?)["']/i);

			if (!imgMatch) return;

			for (let i = 1; i < imgMatch.length; i++) {
				const download = await window.app.downloadImage(imgMatch[i]);

				this.#uploads.set(download, []);
				const image = await this.#imageGrid.addImages(download, true);
				image.showNewIcon();
			}
		} else if (files.length !== 0) {
			for (let i = 0; i < files.length; i++) {
				const path = await window.app.getFilePath(files[i]);

				let download;
				if (path) {
					download = await window.app.downloadImage(path);
				} else {
					download = await window.app.downloadCopiedImage();
				}

				this.#uploads.set(download, []);
				const image = await this.#imageGrid.addImages(download, true);
				image.showNewIcon();
			}
		}
	};

	/**
	 * Handles the paste event.
	 * @param {ClipboardEvent} event
	 */
	#pasteHandle = (event) => {
		event.preventDefault();

		this.#dataTransferHandle(event.clipboardData);
	};

	#selectAllHandle = async () => {
		if (this.#imageGrid.imageCount > 0) {
			const { selectAllShcut } = await window.app.getSettings();

			if (selectAllShcut.length !== keysDown.size) return;

			for (const key of keysDown) {
				if (!selectAllShcut.includes(key)) return;
			}

			this.#imageGrid.select(this.#imageGrid.images);
		}
	};

	/**
	 * Return true if the page has some unsaved changes.
	 * @return {boolean}
	 */
	get hasUnsavedChanges() {
		return this.#uploads.size !== 0;
	}

	/**
	 * Returns the uploaded images and their tags.
	 * @returns {Map<string, string[]>}
	 */
	get uploads() {
		return this.#uploads;
	}

	get mainPage() {
		return this.#elements.find((element) => element.classList.contains('upload-view')).children[0];
	}

	get mainPageElements() {
		return Array.from(this.mainPage.children);
	}
}

export default UploadPage;
