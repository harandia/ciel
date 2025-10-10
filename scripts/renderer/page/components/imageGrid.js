import ImageGridImage from './image.js';

class ImageGrid {
	/** @type {Element} */
	#element;

	/**
	 * @param {Element} element
	 */
	constructor(element) {
		this.#element = element;
	}

	/**
	 * Shows the images in the given source paths. Each path should be a valid path and the path of an actual image.
	 * @param {string[]} paths
	 */
	showImages(paths) {
		const children = this.#element.children;
		for (let i = 0; i < children.length; i++) {
			this.#removeImage(i);
		}

		for (const path of paths) {
			this.#addImages(path);
		}
	}

	/**
	 * Adds an image to the grid with the specified path to the source image.
	 * @param {string} imagePath
	 * @returns {ImageGridImage}
	 */
	#addImages(imagePath) {
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
	#removeImage(param) {
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
}

export default ImageGrid;
