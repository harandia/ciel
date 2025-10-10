class ImageGridImage {
	/**@type {Element} */
	#element;

	/**@type {HTMLImageElement} */
	#image;

	/**
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
