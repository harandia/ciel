class ImageGridImage {
	/**@type {Element} */
	#element;

	/**@type {HTMLImageElement} */
	#image;

	/**@type {HTMLElement} */
	#closeButton;

	/**@type {HTMLElement} */
	#newIcon;

	/**
	 * Returns if the given element has the structure of an ImageGridImage element.
	 * @param {Element} element
	 * @returns {boolean}
	 */
	static isImageGridImage(element) {
		return (
			element.matches('li') &&
			element.children.length === 1 &&
			element.children[0].matches('div') &&
			element.children[0].classList.contains('image-grid-image-container') &&
			element.children[0].children.length === 3 &&
			element.children[0].children[0].matches('img') &&
			element.children[0].children[0].classList.contains('image-grid-image') &&
			element.children[0].children[1].matches('button') &&
			element.children[0].children[1].classList.contains('image-delete-button') &&
			element.children[0].children[2].matches('div') &&
			element.children[0].children[2].classList.contains('image-new-container')
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

			this.#closeButton = this.#element.querySelector('.image-delete-button');

			this.#newIcon = this.#element.querySelector('.image-new-container');

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
	 * Shows the new icon.
	 */
	showNewIcon() {
		this.#newIcon.classList.remove('image-new-container-hidden');
	}

	/**
	 * Hides new icon.
	 */
	hideNewIcon() {
		this.#newIcon.classList.add('image-new-container-hidden');
	}

	/**
	 * Returns the DOM element of the image.
	 * @returns {Element}
	 */
	get element() {
		return this.#element;
	}

	/**
	 * Returns this image's close button.
	 * @returns {Element}
	 */
	get closeButton() {
		return this.#closeButton;
	}

	/**
	 * Returns wether the image is selected or not.
	 * @returns {boolean}
	 */
	get isSelected() {
		return this.#image.classList.contains('image-grid-selected-image');
	}

	/**
	 * Returns the image's route (with file:// protocol)
	 * @returns {string}
	 */
	get path() {
		return this.#image.src;
	}
}

export default ImageGridImage;
