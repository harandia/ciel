/**
 * @abstract
 * @class
 */
class Autocompleter {
	//@ts-ignore
	#element = document.getElementById('autocompleter').content.cloneNode(true).querySelector('.autocompleter');

	constructor(parent) {
		parent.appendChild(this.#element);

		this.#element.addEventListener('mousedown', (event) => {
			event.preventDefault();
		});
	}

	/**
	 * Shows the autocompleter in the specified position, x (left) and y (top) are expressed in pixels. If no position is specified, the Autocompleter will
	 * appear in its last position.
	 * @param {number} [x]
	 * @param {number} [y]
	 */
	show(x, y) {
		if (x) {
			// @ts-ignore
			this.#element.style.setProperty('--autocompleter-left', x + 'px');
		}
		if (y) {
			// @ts-ignore
			this.#element.style.setProperty('--autocompleter-top', y + 'px');
		}

		this.#element.classList.remove('autocompleter-hidden');
	}

	/**
	 * Hides the autocompleter.
	 */
	hide() {
		this.#element.classList.add('autocompleter-hidden');
		this.#element.children[this.selectedIndex]?.classList.remove('autocompleter-selected');
	}

	/**
	 * Deselects the current selected option and selects a new one, which will be returned.
	 * If option is a string, selects the first option with the given name.
	 * If option is a number, selects the specified index starting from 0.
	 * @param {string | number} option
	 * @returns {Element | undefined}
	 */
	selectOption(option) {
		const children = Array.from(this.#element.children);

		this.#element.querySelector('.autocompleter-selected')?.classList.remove('autocompleter-selected');

		if (typeof option === 'number') {
			children[option]?.classList.add('autocompleter-selected');
			return children[option];
		} else if (typeof option === 'string') {
			for (const op of children) {
				if (op.textContent === option) {
					op.classList.add('autocompleter-selected');
					return op;
				}
			}
			return undefined;
		}
	}

	/**
	 * @abstract
	 * Displays the completing options based on the given partialString.
	 * @param {string} partialString
	 */
	showOptions(partialString) {}

	/**
	 * Adds the given option to the end of the autocompleter.
	 * @param {string} option
	 */
	_addOption(option) {
		const optionElement = document.createElement('li');
		optionElement.textContent = option;

		optionElement.addEventListener('mousedown', () => {
			for (let i = 0; i < this.#element.children.length; i++) {
				if (this.#element.children[i] === optionElement) {
					this.selectOption(i);
					return;
				}
			}
		});

		this.#element.appendChild(optionElement);
	}

	/**
	 * Removes option.
	 * If option is a string, deletes the first option with the given name.
	 * If option is a number, deletes the specified index starting from 0.
	 * @param {string | number} option
	 * @returns {boolean}
	 */
	_removeOption(option) {
		if (typeof option === 'number') {
			const children = this.#element.children;
			if (children[option]) {
				this.#element.removeChild(children[option]);
				return true;
			}
			return false;
		} else if (typeof option === 'string') {
			for (const op of Array.from(this.#element.children)) {
				if (op.textContent === option) {
					this.#element.removeChild(op);
					return true;
				}
			}
			return false;
		}
	}

	/**
	 * Removes all the options in the autocompleter.
	 */
	_clear() {
		this.#element.replaceChildren();
	}

	/**
	 * Returns the current selected option or undefined if no option is selected.
	 * @returns {string | undefined}
	 */
	get selectedOption() {
		return this.#element.querySelector('.autocompleter-selected')?.textContent;
	}

	/**
	 * Returns the current selected option index or -1 if no option is selected.
	 * @returns {number}
	 */
	get selectedIndex() {
		const selected = this.#element.querySelector('.autocompleter-selected');
		if (selected) {
			return Array.from(this.#element.children).indexOf(selected);
		}
		return -1;
	}

	/**
	 * Returns the current completing options.
	 * @returns {string[]}
	 */
	get options() {
		const options = [];
		Array.from(this.#element.children).forEach((child) => options.push(child.textContent));
		return options;
	}

	/**
	 * Returns the autocompleter x (left) coordinate.
	 * @returns {number}
	 */
	get x() {
		// @ts-ignore
		return Number(this.#element.style.getPropertyValue('--autocompleter-left') - 'px');
	}

	/**
	 * Sets the x (left) coordinate, expressed in pixels.
	 * @param {number} x
	 */
	set x(x) {
		// @ts-ignore
		this.#element.style.setProperty('--autocompleter-left', x + 'px');
	}

	/**
	 * Returns the autocompleter y (top) coordinate.
	 * @returns {number}
	 */
	get y() {
		// @ts-ignore
		return Number(this.#element.style.getPropertyValue('--autocompleter-top') - 'px');
	}

	/**
	 * Sets the y (top) coordinate, expressed in pixels.
	 * @param {number} y
	 */
	set y(y) {
		// @ts-ignore
		this.#element.style.setProperty('--autocompleter-top', x + 'px');
	}

	/**
	 * Returns the Autocompleter element in the DOM.
	 * @returns {Element}
	 */
	get element() {
		return this.#element;
	}

	/**
	 * Returns wether the autocompleter is hidden or not.
	 * @return {boolean}
	 */
	get isHidden() {
		return this.#element.classList.contains('autocompleter-hidden');
	}
}

class TagAutocompleter extends Autocompleter {
	/**
	 * Stores the 4 previous options with the partialString they complete and the current ones, being the 0 index the oldest one.
	 * @type {{partialString: string, options: string[]}[]}
	 */
	#previousOptions = [];
	#PREV_MAX_LENGHT = 5;

	/**
	 * Displays the completing options based on the given partialString.
	 * @param {string} partialString
	 */
	async showOptions(partialString) {
		const currentOptions = this.options;

		for (let i = this.#previousOptions.length - 1; i > 0; i--) {
			const prevOption = this.#previousOptions[i];

			if (prevOption.partialString === partialString) {
				prevOption.options.forEach((option) => {
					if (!currentOptions.includes(option)) this._addOption(option);
				});
				currentOptions.forEach((option) => {
					if (!prevOption.options.includes(option)) this._removeOption(option);
				});
				this.#previousOptions.splice(i + 1);

				if (this.element.children.length !== 0) this.selectOption(0).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
				return;
			}

			if (partialString.startsWith(prevOption.partialString)) {
				const newOptions = prevOption.options.filter((option) => option.startsWith(partialString));
				currentOptions.forEach((option) => {
					if (!newOptions.includes(option)) this._removeOption(option);
				});
				this.#pushNewOptions({ partialString, options: newOptions });

				if (this.element.children.length !== 0) this.selectOption(0).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
				return;
			}
		}

		this._clear();

		const allTags = await window.app.getTags();
		const newOptions = allTags.filter((option) => option.startsWith(partialString));
		newOptions.forEach((option) => this._addOption(option));
		this.#pushNewOptions({ partialString, options: newOptions });

		if (this.element.children.length !== 0) this.selectOption(0).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
	}

	/**
	 * Pushes the new options to the previousOptions array, if it exceeds the max length it deletes the oldest options stored.
	 * @param {{partialString: string, options: string[]}} newOptions
	 */
	#pushNewOptions(newOptions) {
		this.#previousOptions.push(newOptions);
		if (this.#previousOptions.length > this.#PREV_MAX_LENGHT) {
			this.#previousOptions.splice(0, 1);
		}
	}
}

export default TagAutocompleter;
export { Autocompleter };
