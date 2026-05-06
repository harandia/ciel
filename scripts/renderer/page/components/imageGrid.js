import ContextMenu from '../../contextMenu.js';
import keysDown from '../../general.js';
import UploadEditor from './editor/uploadEditor.js';
import ImageGridImage from './image.js';

class ImageGrid {
	/**@type {(ImageGridImage | Element)[]} */
	#images = [];

	/**@type {number} */
	#row0;
	/**@type {number} */
	#rowend;

	/** @type {Element} */
	#element;

	/**@type {Function[]} */
	#onpreselect = [];

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

	/** @type {boolean} */
	#deselectPrevented = false;

	/** @type {boolean} */
	#selectPrevented = false;

	/**
	 * @param {Element} element
	 */
	constructor(element) {
		this.#element = element;

		this.#element.addEventListener('mousedown', (event) => {
			event.preventDefault();
		});

		if (this.#element.children.length) this.#images.push(this.#element.firstElementChild);
	}

	/**
	 * Shows the images in the given source paths. Each path should be a valid path and the path of an actual image.
	 * @param {string[]} paths
	 */
	async showImages(paths) {
		const children = this.images;
		for (let i = 0; i < children.length; i++) {
			this.removeImage(i);
		}

		for (const path of paths) {
			await this.addImages(path);
		}

		for (const func of this.#onshow) func(this.images);

		this.updateLayout();
	}

	/**
	 * Sets the callback to be executed when the specified event is triggered.
	 * show is triggered after the showImages method, and the functions are given the displayed images.
	 * preselect is triggered when an image is going to be selected, the functions are given the selection that is going to become effective.
	 * select is triggered when an image is selected, the functions are given the selected images.
	 * deselect is triggered before an image is deselected, the functions are given the image that is going to be deselected.
	 * delete is triggered after an image is deleted, the functions are given the deleted ImageGridImage.
	 * @param {'show' | 'select' | 'deselect' | 'delete' | 'preselect'} eventType
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
			case 'preselect':
				this.#onpreselect.push(callback);
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
			images = [this.images[param]];
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

		for (const func of this.#onpreselect) await func(currentSelection);

		if (this.#preventSelect) {
			this.#preventSelect = false;
			this.#selectPrevented = true;
			return;
		}

		for (const func of this.#onselect) await func(currentSelection);

		if (this.#preventSelect) {
			this.#preventSelect = false;
			this.#selectPrevented = true;
			return;
		}

		for (const image of images) {
			if (!image.isSelected) {
				image.select();
			}
		}

		if (this.selectedImages.length) this.#element.classList.remove('image-grid-no-selection');

		this.#preventSelect = false;
		this.#selectPrevented = false;
	}

	/**
	 * Stops the current selection from happening.
	 */
	stopSelect() {
		this.#preventSelect = true;
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

		if (this.#preventDeselect) {
			this.#preventDeselect = false;
			this.#deselectPrevented = true;
			return;
		}

		for (const image of images) image.deselect();

		if (this.selectedImages.length === 0) this.#element.classList.add('image-grid-no-selection');

		this.#preventDeselect = false;
		this.#deselectPrevented = false;
	}

	/**
	 * Prevents the current deselection proccess of happening.
	 */
	stopDeselect() {
		this.#preventDeselect = true;
	}

	/**
	 * Adds an image to the grid with the specified path to the source image. If update is true, it will update the
	 * layout of the grid.
	 * @param {string} imagePath
	 * @param {boolean} update
	 * @returns {Promise<ImageGridImage>}
	 */
	async addImages(imagePath, update = false) {
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
				this.removeImage(image, true);
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

		this.#images.splice(0, 0, image);

		if (update) await this.updateLayout();
		// image.load();
		// this.element.prepend(image.element);

		return image;
	}

	/**
	 * Returns true if the specified element was successfully deleted.
	 * If param is number, it will delete the specified index starting from 0.
	 * If param is an ImageGridImage, it will delete the given image.
	 * If update is true, it will update the layout of the grid after removing the image.
	 * @param {ImageGridImage | number} param
	 * @param {boolean} [update]
	 * @returns {Promise<boolean>}
	 */
	async removeImage(param, update = false) {
		let removed;
		let removedImage;
		if (typeof param === 'number') {
			if (this.images[param]) {
				removedImage = this.images[param];
				this.#images.splice(param, 1);
				// this.#element.removeChild(children[param]);
				removed = true;
			}
			removed = false;
		} else {
			removedImage = param;

			removed = false;
			for (let i = 0; i < this.images.length; i++) {
				const child = this.images[i];
				if (child === param) {
					this.#images.splice(i, 1);
					// this.#element.removeChild(child);
					removed = true;
					break;
				}
			}
		}
		if (removed) {
			for (const func of this.#ondelete) await func(removedImage);
			if (update) await this.updateLayout();
		}
		return removed;
	}

	/**
	 * Updates the layout of the grid. If no scroll is given, the function will take the scroll
	 * it was last registered when calling this function (it will take 0 if it is the first time the
	 * function is called and no scroll is given).
	 * @param {number} [scroll]
	 */
	async updateLayout(scroll) {
		const rowgap = Number.parseFloat(window.getComputedStyle(this.#element).getPropertyValue('row-gap'));

		const ncol = await this.#ncol();
		const nrow = await this.#nrow();

		const { imageSize } = await window.app.getSettings();

		this.#element.replaceChildren();

		if (scroll !== undefined || !this.#row0 || !this.#rowend) {
			if (scroll !== undefined) {
				const row1 = Math.floor(scroll / (imageSize + rowgap));
				if (row1 >= 3) this.#row0 = row1 - 3;
				else if (row1 === 1) this.#row0 = row1 - 1;
				else this.#row0 = 0;
			} else if (!this.#row0) {
				this.#row0 = 0;
			}
			const imgStartOnwards = this.#images.length - this.#row0 * ncol;
			if (imgStartOnwards <= 0) {
				this.#rowend = this.#row0 + 1;
			} else {
				const totalRowsLeft = Math.ceil(imgStartOnwards / ncol);
				if (totalRowsLeft > nrow + 3) this.#rowend = this.#row0 + nrow + 3;
				else if (totalRowsLeft > nrow + 1) this.#rowend = this.#row0 + nrow + 1;
				else this.#rowend = this.#row0 + totalRowsLeft;
			}
		}

		this.#rowend += 10;
		const totalrows = Math.ceil(this.#images.length / ncol);
		if (this.#rowend > totalrows) this.#rowend = totalrows;

		// @ts-ignore
		this.#element.style.paddingTop = this.#row0 * (imageSize + rowgap) + 'px';

		const paddingBottom = totalrows - 1 - this.#rowend;
		// @ts-ignore
		this.#element.style.paddingBottom = (paddingBottom > 0 ? paddingBottom : 0) * (imageSize + rowgap) + 'px';

		for (const image of this.#images.slice(this.#row0 * ncol, this.#rowend * ncol)) {
			if (image instanceof ImageGridImage) {
				image.load();
				this.#element.appendChild(image.element);
			} else {
				this.#element.appendChild(image);
			}
		}

		console.log(this.#element.children.length);
	}

	/**
	 * Returns the number of columns of the grid.
	 * @returns {Promise<number>}
	 */
	async #ncol() {
		if (!this.#images.length) return 0;

		const { imageSize } = await window.app.getSettings();
		const columngap = Number.parseFloat(window.getComputedStyle(this.#element).getPropertyValue('column-gap'));
		return Math.floor(this.#element.getBoundingClientRect().width / (imageSize + columngap));
	}

	/**
	 * Returns the number of visible rows.
	 * @returns {Promise<number>}
	 */
	async #nrow() {
		if (!this.#images.length) return 0;

		const { imageSize } = await window.app.getSettings();
		const rowgap = Number.parseFloat(window.getComputedStyle(this.#element).getPropertyValue('row-gap'));
		return Math.ceil(this.#visibleHeight() / (imageSize + rowgap));
	}

	/**
	 * Returns the visible height of the grid.
	 * @returns {number}
	 */
	#visibleHeight() {
		const rect = this.#element.getBoundingClientRect();
		const viewportHeight = window.innerHeight;

		const visibleTop = Math.max(rect.top, 0);

		return Math.max(0, viewportHeight - visibleTop);
	}

	get imageCount() {
		return this.images.length;
	}

	/**
	 * Returns all the images displayed on the grid.
	 */
	get images() {
		return this.#images.filter((image) => image instanceof ImageGridImage);
	}

	/**
	 * Returns the seleted images of the grid.
	 * @returns {ImageGridImage[]}
	 */
	get selectedImages() {
		const selection = [];
		for (const img of this.images) {
			if (img.isSelected) selection.push(img);
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

	/**
	 * Returns true if the last deselect operation was stopped.
	 * @returns {boolean}
	 */
	get deselectStopped() {
		return this.#deselectPrevented;
	}

	/**
	 * Returns true if the last select operation was stopped.
	 * @returns {boolean}
	 */
	get selectStopped() {
		return this.#selectPrevented;
	}
}

export default ImageGrid;
