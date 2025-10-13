import ImageGridImage from './image.js';

class ImageGrid {
	/** @type {Element} */
	#element;

	/**@type {Function[]} */
	#onselect = [];

	/**@type {Function[]} */
	#onshow = [];

	/**
	 * @param {Element} element
	 */
	constructor(element) {
		this.#element = element;

		this.#element.addEventListener('mousedown', (event) => {
			event.preventDefault();
		});
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
	 * selects is triggered when an image is selected or deselected, the functions are given the selected images.
	 * @param {'show' | 'select'} eventType
	 * @param {Function} callback
	 */
	addEventListener(eventType, callback) {
		if (eventType === 'show') {
			this.#onshow.push(callback);
		} else if (eventType === 'select') {
			this.#onselect.push(callback);
		}
	}

	/**
	 * Selects the given image.
	 * If param is an ImageGridImage, it will select the specific element.
	 * If param is a number, it will select the specified index, starting from 0.
	 * If param is a string, it will select the first image in the grid with the given path.
	 * @param {ImageGridImage | number | string} param
	 */
	select(param) {
		if (typeof param === 'number') {
			const image = new ImageGridImage(this.#element.children[param]);
			image.select();
		} else if (typeof param === 'string') {
			this.images.find((image) => image.path === param).select();
		} else {
			param.select();
		}

		for (const func of this.#onselect) func(this.selectedImages);
	}

	/**
	 * Deselects the given image.
	 * If param is an ImageGridImage, it will deselect the specific element.
	 * If param is a number, it will deselect the specified index, starting from 0.
	 * If param is a string, it will deselect the first image in the grid with the given path.
	 * @param {ImageGridImage | number | string} param
	 */
	deselect(param) {
		if (typeof param === 'number') {
			this.images[param].deselect();
		} else if (typeof param === 'string') {
			this.images.find((image) => image.path === param).deselect();
		} else {
			param.deselect();
		}

		for (const func of this.#onselect) func(this.selectedImages);
	}

	/**
	 * Adds an image to the grid with the specified path to the source image.
	 * @param {string} imagePath
	 * @returns {ImageGridImage}
	 */
	addImages(imagePath) {
		const image = new ImageGridImage(imagePath);

		image.element.addEventListener('click', (event) => {
			// @ts-ignore
			if (event.ctrlKey) {
				if (!image.isSelected) image.select();
				else image.deselect();
			} else {
				image.select();
				for (const otherImage of Array.from(this.#element.children)) {
					if (otherImage !== image.element) new ImageGridImage(otherImage).deselect();
				}
			}
			for (const func of this.#onselect) func(this.selectedImages);
		});

		this.#element.appendChild(image.element);

		return image;
	}

	/**
	 * Returns true if the specified element was successfully deleted.
	 * If param is number, it will delete the specified index starting from 0.
	 * If param is an ImageGridImage, it will delete the given image.
	 * @param {ImageGridImage | number} param
	 * @returns {boolean}
	 */
	removeImage(param) {
		let removed;
		const children = this.#element.children;
		if (typeof param === 'number') {
			if (children[param]) {
				this.#element.removeChild(children[param]);
				removed = true;
			}
			removed = false;
		} else {
			removed = false;
			for (const child of Array.from(children)) {
				if (child === param.element) {
					this.#element.removeChild(child);
					removed = true;
					break;
				}
			}
		}
		return removed;
	}

	get imageCount() {
		return this.#element.children.length;
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
