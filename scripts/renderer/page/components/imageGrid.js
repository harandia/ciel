import ContextMenu from '../../contextMenu.js';
import keysDown from '../../general.js';
import ImageGridImage from './image.js';

class ImageGrid {
	/** @type {Element} */
	#element;

	/**@type {Function[]} */
	#onselect = [];

	/**@type {Function[]} */
	#onshow = [];

	/**@type {Function[]} */
	#ondeselect = [];

	/**@type {Function[]} */
	#ondelete = [];

	/** @type {boolean} */
	#preventDeselect;

	/** @type {boolean} */
	#preventSelect;

	/**
	 * @param {Element} element
	 */
	constructor(element) {
		this.#element = element;

		this.#element.addEventListener('mousedown', (event) => {
			event.preventDefault();
		});

		const shortcutHandler = async () => {
			if (!document.contains(this.#element)) {
				document.removeEventListener('keydown', shortcutHandler);
				return;
			}

			if (this.imageCount > 0) {
				const { selectAllShcut } = await window.app.getSettings();

				if (selectAllShcut.length !== keysDown.size) return;

				for (const key of keysDown) {
					if (!selectAllShcut.includes(key)) return;
				}

				this.select(this.images);
			}
		};
		setTimeout(() => {
			document.addEventListener('keydown', shortcutHandler);
		}, 100);
	}

	/**
	 * Shows the images in the given source paths. Each path should be a valid path and the path of an actual image.
	 * @param {string[]} paths
	 */
	showImages(paths) {
		const children = this.#element.children;
		for (let i = 0; i < children.length; i++) {
			this.removeImage(i);
		}

		for (const path of paths) {
			this.addImages(path);
		}

		for (const func of this.#onshow) func(this.images);
	}

	/**
	 * Sets the callback to be executed when the specified event is triggered.
	 * show is triggered after the showImages method, and the functions are given the displayed images.
	 * select is triggered when an image is selected or deselected, the functions are given the selected images.
	 * deselect is triggered before an image is deselected, the functions are given the image that is going to be deselected.
	 * delete is triggered after an image is deleted, the functions are given the deleted ImageGridImage.
	 * @param {'show' | 'select' | 'deselect' | 'delete'} eventType
	 * @param {Function} callback
	 */
	addEventListener(eventType, callback) {
		switch (eventType) {
			case 'show':
				this.#onshow.push(callback);
				break;
			case 'select':
				this.#onselect.push(callback);
				break;
			case 'deselect':
				this.#ondeselect.push(callback);
				break;
			case 'delete':
				this.#ondelete.push(callback);
				break;
		}
	}

	/**
	 * Selects the given image.
	 * If param is an ImageGridImage, it will select the specific element.
	 * If param is a number, it will select the specified index, starting from 0.
	 * If param is a string, it will select the first image in the grid with the given path.
	 * @param {ImageGridImage[] | ImageGridImage | number | string} param
	 */
	async select(param) {
		let images;
		if (typeof param === 'number') {
			images = [new ImageGridImage(this.#element.children[param])];
		} else if (typeof param === 'string') {
			images = [this.images.find((image) => image.path === param)];
		} else if (param instanceof ImageGridImage) {
			images = [param];
		} else {
			images = param;
		}

		const currentSelection = this.selectedImages;

		for (const image of images) {
			if (!image.isSelected) currentSelection.push(image);
		}

		for (const func of this.#onselect) await func(currentSelection);

		if (!this.#preventSelect) {
			for (const image of images) {
				if (!image.isSelected) {
					image.select();
				}
			}
		}

		this.#preventSelect = false;
	}

	/**
	 * Stops the current selection from happening.
	 */
	stopSelect() {
		this.#preventSelect = true;
	}

	/**
	 * Selects all the images of the grid.
	 */
	selectAll() {
		console.log(1);
		let i = 0;

		const interval = setInterval(() => {
			if (i >= this.imageCount) {
				clearInterval(interval);
				return;
			}

			if (!this.images[i].isSelected) this.select(i);
			i++;
		}, 10);
	}

	/**
	 * Deselects the given image.
	 * If param is an ImageGridImage, it will deselect the specific element.
	 * If param is a number, it will deselect the specified index, starting from 0.
	 * If param is a string, it will deselect the first image in the grid with the given path.
	 * @param {ImageGridImage[] | ImageGridImage | number | string} param
	 */
	async deselect(param) {
		let images;

		if (typeof param === 'number') {
			images = [this.images[param]];
		} else if (typeof param === 'string') {
			images = [this.images.find((image) => image.path === param)];
		} else if (param instanceof ImageGridImage) {
			images = [param];
		} else {
			images = param;
		}

		for (const func of this.#ondeselect) await func(images);

		if (!this.#preventDeselect) {
			for (const image of images) image.deselect();
		}
		this.#preventDeselect = false;
	}

	/**
	 * Prevents the current deselection proccess of happening.
	 */
	stopDeselect() {
		this.#preventDeselect = true;
	}

	/**
	 * Adds an image to the grid with the specified path to the source image.
	 * @param {string} imagePath
	 * @returns {ImageGridImage}
	 */
	addImages(imagePath) {
		const image = new ImageGridImage(imagePath);

		let clickTimer;

		image.element.addEventListener('click', (event) => {
			if (!event.composedPath().includes(image.closeButton)) {
				if (!clickTimer) {
					clickTimer = setTimeout(async () => {
						// @ts-ignore
						if (event.ctrlKey) {
							if (!image.isSelected) this.select(image);
							else await this.deselect(image);
						} else {
							await this.deselect(this.images);
							await this.select(image);
						}

						clickTimer = undefined;
					}, 225);
				}
			}
		});

		image.element.addEventListener('dblclick', () => {
			clearTimeout(clickTimer);
			window.app.openImage(image.path);

			clickTimer = undefined;
		});

		const deleteImage = async () => {
			const deleted = await window.app.deleteImage(image.path);

			if (deleted) {
				if (image.isSelected) {
					this.deselect(image);
				}
				this.removeImage(image);
			}
		};

		image.closeButton.addEventListener('click', async (event) => {
			deleteImage();
		});

		image.element.addEventListener('contextmenu', (event) => {
			const menuOptions = [];
			menuOptions.push({
				item: 'Open image',
				click: () => {
					window.app.openImage(image.path);
				},
			});
			if (!image.isSelected) {
				menuOptions.push({ item: 'Select image', click: () => this.select(image) });
			} else {
				menuOptions.push({ item: 'Deselect image', click: () => this.deselect(image) });
			}

			menuOptions.push('separator');
			menuOptions.push({
				item: 'Delete image',
				click: () => {
					deleteImage();
				},
			});

			// @ts-ignore
			ContextMenu.show(event.clientX, event.clientY, menuOptions);
		});

		this.#element.prepend(image.element);

		return image;
	}

	/**
	 * Returns true if the specified element was successfully deleted.
	 * If param is number, it will delete the specified index starting from 0.
	 * If param is an ImageGridImage, it will delete the given image.
	 * @param {ImageGridImage | number} param
	 * @returns {Promise<boolean>}
	 */
	async removeImage(param) {
		let removed;
		let removedImage;
		const children = this.#element.children;
		if (typeof param === 'number') {
			if (children[param]) {
				removedImage = new ImageGridImage(children[param]);
				this.#element.removeChild(children[param]);
				removed = true;
			}
			removed = false;
		} else {
			removedImage = param;

			removed = false;
			for (const child of Array.from(children)) {
				if (child === param.element) {
					this.#element.removeChild(child);
					removed = true;
					break;
				}
			}
		}
		if (removed) {
			for (const func of this.#ondelete) await func(removedImage);
		}
		return removed;
	}

	get imageCount() {
		return this.images.length;
	}

	/**
	 * Returns all the images displayed on the grid.
	 */
	get images() {
		const images = [];
		for (const child of Array.from(this.#element.children)) {
			if (ImageGridImage.isImageGridImage(child)) {
				const image = new ImageGridImage(child);
				images.push(image);
			}
		}
		return images;
	}

	/**
	 * Returns the seleted images of the grid.
	 * @returns {ImageGridImage[]}
	 */
	get selectedImages() {
		const selection = [];
		for (const child of Array.from(this.#element.children)) {
			if (ImageGridImage.isImageGridImage(child)) {
				const image = new ImageGridImage(child);
				if (image.isSelected) selection.push(image);
			}
		}
		return selection;
	}

	/**
	 * Returns the DOM element of the image grid.
	 * @returns {Element}
	 */
	get element() {
		return this.#element;
	}
}

export default ImageGrid;
