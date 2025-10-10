import Tag from '../../tag.js';
import TagAutocompleter, { Autocompleter } from './autocompleter.js';

class TagInput {
	/** @type {HTMLElement} */
	_container;

	/** @type {HTMLElement} */
	_input;

	/**
	 * The element needs to have the structure of a container(that will contain the tags) and inside of it as the last child and element
	 * with the class 'tag-input' (where the text for the tags will be taken from).
	 * @param {HTMLElement} element
	 * @param {Autocompleter} autocompleter
	 */
	constructor(element, autocompleter) {
		this._container = element;
		this._input = element.querySelector('.tag-input');

		this._input.addEventListener('paste', (event) => {
			event.preventDefault();

			this._input.textContent = event.clipboardData.getData('text');
		});

		this._input.addEventListener('dragover', (event) => {
			event.preventDefault();
			event.dataTransfer.dropEffect = 'none';
		});

		const caretElement = caret();

		const updateAutocompleter = () => {
			const caretRect = window.getSelection().getRangeAt(0).getBoundingClientRect();
			if (caretRect.x && caretRect.y) {
				autocompleter.show(caretRect.x - 50, caretRect.y - 50);
			} else {
				const inputRect = this._input.getBoundingClientRect();
				autocompleter.show(inputRect.x - 50, inputRect.y - 50);
			}
			const text = this._input.textContent.startsWith('!')
				? this._input.textContent.trim().toLowerCase().slice(1)
				: this._input.textContent.trim().toLowerCase();
			autocompleter.showOptions(text);
		};

		const autocomplete = () => {
			let text = autocompleter.selectedOption;
			if (this._input.textContent.startsWith('!')) {
				text = '!' + text;
			}
			this.addTag(text);
			this._input.textContent = '';
		};

		const caretHandle = (event) => {
			if (event.key === 'ArrowLeft') {
				if (caretElement.previousElementSibling) {
					this._container.insertBefore(caretElement, caretElement.previousElementSibling);
				}
			} else if (event.key === 'ArrowRight') {
				if (caretElement.nextElementSibling) {
					if (caretElement.nextElementSibling.nextElementSibling === this._input) {
						this._input.focus();
					} else {
						this._container.insertBefore(caretElement, caretElement.nextElementSibling.nextElementSibling);
					}
				}
			} else if (event.key === 'Backspace') {
				if (caretElement.previousElementSibling) {
					// @ts-ignore
					this.removeTag(Tag.fromElement(caretElement.previousElementSibling));
				}
			} else {
				this._input.focus();
			}
		};

		/**
		 * Inserts the caret in the given position, being 0 the position between the input and the last tag and tagCount the
		 * position before the first tag.
		 * @param {number} pos
		 */
		const insertCaret = (pos) => {
			this._container.focus();

			const children = this._elements;
			if (!this._container.contains(caretElement)) {
				this._container.addEventListener(
					'blur',
					() => {
						this._container.removeChild(caretElement);
					},
					{ once: true },
				);

				setTimeout(() => {
					this._container.addEventListener('keydown', caretHandle);
				}, 100);
			}

			this._container.insertBefore(caretElement, children[children.length - 1 - pos]);
		};

		this._input.addEventListener('keydown', (event) => {
			switch (event.key) {
				case 'ArrowLeft':
					event.stopPropagation();
					const caretRange = window.getSelection().getRangeAt(0);
					if (caretRange.startOffset === 0 && this._container.children.length > 1) {
						insertCaret(1);
					}
					break;
				case 'ArrowDown':
					event.preventDefault();
					if (autocompleter.options.length !== 0) {
						if (autocompleter.selectedIndex !== autocompleter.options.length - 1) {
							autocompleter.selectOption(autocompleter.selectedIndex + 1).scrollIntoView({
								behavior: 'smooth',
								block: 'nearest',
								inline: 'nearest',
							});
						} else {
							autocompleter.selectOption(0).scrollIntoView({
								behavior: 'smooth',
								block: 'nearest',
								inline: 'nearest',
							});
						}
					}

					break;
				case 'ArrowUp':
					event.preventDefault();
					if (autocompleter.options.length !== 0) {
						if (autocompleter.selectedIndex > 0) {
							autocompleter.selectOption(autocompleter.selectedIndex - 1).scrollIntoView({
								behavior: 'smooth',
								block: 'nearest',
								inline: 'nearest',
							});
						} else {
							autocompleter.selectOption(autocompleter.options.length - 1).scrollIntoView({
								behavior: 'smooth',
								block: 'nearest',
								inline: 'nearest',
							});
						}
					}
					break;
				case 'Enter':
					event.preventDefault();

					if (autocompleter.selectedOption) {
						autocomplete();
					}
					break;
				case 'Tab':
					event.preventDefault();

					if (autocompleter.selectedOption) {
						autocomplete();
					}
					break;
				case ' ':
					const text = this._input.textContent.trim();
					if (text.length !== 0) {
						event.preventDefault();
						this.addTag(text);
						this._input.textContent = '';
					}
					break;
				case 'Escape':
					this._input.blur();
				default:
			}
		});

		this._input.addEventListener('keyup', (event) => {
			switch (event.key) {
				case 'ArrowDown':
					break;
				case 'ArrowUp':
					break;
				case 'Tab':
					if (this._input.textContent.trim().length === 0 && !autocompleter.selectedOption) {
						updateAutocompleter();
						break;
					}
				default:
					if (this._input.textContent.trim().length === 0) {
						autocompleter.hide();
					} else {
						updateAutocompleter();
					}

					break;
			}
		});

		this._input.addEventListener('beforeinput', (event) => {
			if (event.inputType === 'deleteContentBackward') {
				if (this._input.textContent.length === 0) {
					this.removeTag(-1);
				}
			}
		});

		this._input.addEventListener('blur', () => {
			autocompleter.hide();
		});

		this._container.addEventListener('click', (event) => {
			if (event.target === this._container) {
				const children = this._elements;
				for (let i = 0; i < children.length - 1; i++) {
					const rect = children[i].getBoundingClientRect();
					if (rect.x + rect.width / 2 > event.clientX) {
						insertCaret(children.length - i - 1);
						return;
					}
				}
				this._input.focus();
			}
		});

		document.addEventListener('mousedown', (event) => {
			// @ts-ignore
			if (event.composedPath().some((element) => Array.from(autocompleter.element.children).includes(element))) {
				autocomplete();
			}
		});

		document.addEventListener('mouseup', (event) => {
			// @ts-ignore
			if (event.composedPath().some((element) => Array.from(autocompleter.element.children).includes(element))) {
				updateAutocompleter();
			}

			if (this._input.textContent.trim().length === 0) autocompleter.hide();
		});
	}

	/**
	 * Adds the given tag to the TagInput.
	 * @param {Tag} tag
	 */
	_addTag(tag) {
		this._container.insertBefore(tag.element, this._container.lastElementChild);
		this._input.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
	}

	/**
	 * @abstract
	 * Adds the given tag to the TagInput.
	 * @param {string} tag
	 */
	addTag(tag) {}

	/**
	 * Adds a tag generated from the content of the input to the TagInput.
	 */
	addFromInput() {}

	/**
	 * Deletes the first tag that is equal to the given tag if param is a Tag.
	 * Deletes the first tag with the specified name if param is a string.
	 * Deletes the tag in that specific position if param is a number.
	 * The positions go from 0 to tagCount - 1. Negative numbers are allowed and start from the last position.
	 * @param {number | Tag | string} param
	 * @returns {boolean}
	 */
	removeTag(param) {
		return false;
	}

	/**
	 * Returns the number of tags inside the TagInput.
	 * @returns {number}
	 */
	get tagCount() {
		let count = 0;
		const children = this._container.children;
		for (let i = 0; i < children.length; i++) {
			if (children[i] !== this._input && !children[i].classList.contains('tag-input-caret')) count++;
		}
		return count;
	}

	/**
	 * Returns the tag elements stored in the container.
	 * @returns {Element[]}
	 */
	get _elements() {
		const children = this._container.children;
		const tags = [];
		for (let i = 0; i < children.length; i++) {
			// @ts-ignore
			if (!children[i].classList.contains('tag-input-caret')) tags.push(children[i]);
		}
		return tags;
	}

	/**
	 * Returns the tags stored in the container.
	 * @returns {Tag[]}
	 */
	get tags() {
		const children = this._container.children;
		const tags = [];
		for (let i = 0; i < children.length; i++) {
			// @ts-ignore
			if (children[i] !== this._input && !children[i].classList.contains('tag-input-caret')) tags.push(Tag.fromElement(children[i]));
		}
		return tags;
	}
}

/**
 * Returns a caret element.
 * @returns {HTMLElement}
 */
const caret = function () {
	// @ts-ignore
	return document.getElementById('tag-input-caret').content.cloneNode(true).querySelector('.tag-input-caret');
};

export default TagInput;
