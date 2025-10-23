import Tag from '../../tag.js';
import TagAutocompleter, { Autocompleter } from './autocompleter.js';

/**
 * @class
 * @abstract
 */
class TagInput {
	/**Autocompleter offset position in pixels */
	_autocompleterOffsetX = 0;
	_autocompleterOffsetY = 0;

	/**Autocompleter last registered position */
	#autocompleterX;
	#autocompleterY;

	/** @type {HTMLElement} */
	container;

	/** @type {HTMLElement} */
	_input;

	/**
	 * The element needs to have the structure of a container(that will contain the tags) and inside of it as the last child and element
	 * with the class 'tag-input' (where the text for the tags will be taken from).
	 * @param {HTMLElement} element
	 * @param {Autocompleter} autocompleter
	 */
	constructor(element, autocompleter) {
		this.container = element;
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
			const containerParentRect = autocompleter.parent.getBoundingClientRect();
			const completerRect = autocompleter.element.getBoundingClientRect();

			let positionx;
			let positiony;

			if (caretRect.x && caretRect.y) {
				positionx = caretRect.x - containerParentRect.x + this._autocompleterOffsetX;
				positiony = caretRect.y - containerParentRect.y + this._autocompleterOffsetY;
			} else {
				const inputRect = this._input.getBoundingClientRect();

				positionx = inputRect.x - containerParentRect.x + this._autocompleterOffsetX;
				positiony = inputRect.y - containerParentRect.y + this._autocompleterOffsetY;
			}

			const autcompleterOverflows = containerParentRect.x + containerParentRect.width - caretRect.x <= completerRect.width - 10;

			if (!autcompleterOverflows) {
				autocompleter.show(positionx, positiony);

				this.#autocompleterX = positionx;
				this.#autocompleterY = positiony;
			} else {
				const overflowx = completerRect.width - 20 - (containerParentRect.x + containerParentRect.width - caretRect.x);

				autocompleter.show(positionx - overflowx - 10, positiony);
			}

			const text = this._input.textContent.startsWith('!')
				? this._input.textContent.trim().toLowerCase().replace(/^!+/, '')
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
					this.container.insertBefore(caretElement, caretElement.previousElementSibling);
				}
			} else if (event.key === 'ArrowRight') {
				if (caretElement.nextElementSibling) {
					if (caretElement.nextElementSibling.nextElementSibling === this._input) {
						this._input.focus();
					} else {
						this.container.insertBefore(caretElement, caretElement.nextElementSibling.nextElementSibling);
					}
				}
			} else if (event.key === 'Backspace') {
				if (caretElement.previousElementSibling) {
					const removingElement = caretElement.previousElementSibling;
					// @ts-ignore
					const removingTag = Tag.fromElement(removingElement);
					this.removeTag(removingTag);
					if (this.tags.some((tag) => tag.type === 'deleted' && tag.name === removingTag.name)) {
						this.container.insertBefore(caretElement, removingElement);
					}
				}
			} else if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
				this._input.focus();
			}
		};

		/**
		 * Inserts the caret in the given position, being 0 the position between the input and the last tag and tagCount the
		 * position before the first tag.
		 * @param {number} pos
		 */
		const insertCaret = (pos) => {
			this.container.focus();

			const children = this._tagElements;
			if (!this.container.contains(caretElement)) {
				this.container.addEventListener(
					'blur',
					() => {
						this.container.removeChild(caretElement);
					},
					{ once: true },
				);

				setTimeout(() => {
					this.container.addEventListener('keydown', caretHandle);
				}, 100);
			}

			this.container.insertBefore(caretElement, children[children.length - 1 - pos]);
		};

		this._input.addEventListener('keydown', (event) => {
			switch (event.key) {
				case 'ArrowLeft':
					event.stopPropagation();
					const caretRange = window.getSelection().getRangeAt(0);
					if (caretRange.startOffset === 0 && this.container.children.length > 1) {
						insertCaret(1);
					}
					break;
				case 'ArrowDown':
					event.preventDefault();
					if (!autocompleter.isHidden) {
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
					}

					break;
				case 'ArrowUp':
					event.preventDefault();
					if (!autocompleter.isHidden) {
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
					insertCaret(1);
					this.removeTag(-1);
				}
			}
		});

		this._input.addEventListener('blur', () => {
			autocompleter.hide();
		});

		this.container.addEventListener('click', (event) => {
			if (event.target === this.container) {
				const children = this._tagElements;
				let firstOfRow = 0;
				for (let i = 1; i < children.length - 1; i++) {
					const rect = children[i].getBoundingClientRect();

					if (rect.y > event.clientY) break;

					if (rect.y > children[firstOfRow].getBoundingClientRect().y) firstOfRow = i;
				}
				for (let i = firstOfRow; i < children.length - 1; i++) {
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
				autocompleter.hide();
			}
		});

		document.addEventListener('mouseup', (event) => {
			// @ts-ignore
			if (event.composedPath().some((element) => Array.from(autocompleter.element.children).includes(element))) {
				updateAutocompleter();
			}
		});
	}

	/**
	 * Adds the given tag to the TagInput.
	 * @param {Tag} tag
	 */
	_addTag(tag) {
		this.container.insertBefore(tag.element, this.container.lastElementChild);
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
		const children = this.container.children;
		for (let i = 0; i < children.length; i++) {
			if (children[i] !== this._input && !children[i].classList.contains('tag-input-caret')) count++;
		}
		return count;
	}

	/**
	 * Returns the tag elements stored in the container.
	 * @returns {Element[]}
	 */
	get _tagElements() {
		const children = this.container.children;
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
		const children = this.container.children;
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
