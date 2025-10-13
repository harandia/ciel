class ImageGridImage {
	/**@type {Element} */
	#element;

	/**@type {HTMLImageElement} */
	#image;

	/**
	 * Returns if the given element has the structure of an ImageGridImage element.
	 * @param {Element} element
	 * @returns {boolean}
	 */
	static isImageGridImage(element) {
		return (
			element.matches('li') &&
			element.children.length === 2 &&
			element.children[0].matches('img') &&
			element.children[0].classList.contains('image-grid-image') &&
			element.children[1].matches('button') &&
			element.children[1].classList.contains('image-delete-button')
		);
	}

	/**
	 * Builds an ImageGridImage.
	 * If param is a string, it will build an ImageGridImage with the given image path.
	 * If param is an Element, it will build an ImageGridImage from the given element.
	 * @param {string | Element} param
	 */
	constructor(param) {
		if (typeof param === 'string') {
			//@ts-ignore
			this.#element = document.getElementById('image-grid-image').content.cloneNode(true).querySelector('li');

			this.#image = this.#element.querySelector('.image-grid-image');
			this.#image.src = param;

			this.#element.addEventListener('mousedown', (event) => {
				event.preventDefault();
			});
		} else {
			this.#element = param;
			this.#image = this.#element.querySelector('.image-grid-image');
		}
	}

	/**
	 * Selectes the image.
	 */
	select() {
		this.#image.classList.add('image-grid-selected-image');
	}

	/**
	 * Deselects the image.
	 */
	deselect() {
		this.#image.classList.remove('image-grid-selected-image');
	}

	/**
	 * Returns the DOM element of the image.
	 * @returns {Element}
	 */
	get element() {
		return this.#element;
	}

	/**
	 * Returns wether the image is selected or not.
	 * @returns {boolean}
	 */
	get isSelected() {
		return this.#image.classList.contains('image-grid-selected-image');
	}

	/**
	 * Returns the image's route.
	 * @returns {string}
	 */
	get path() {
		return this.#image.src;
	}
}

export default ImageGridImage;
