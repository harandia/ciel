class Tag {
	/** @type {HTMLElement} */
	#element;

	/**
	 *
	 * @param {string} name
	 * @param {'normal' | 'wrong' | 'newAdded' | 'firstTime' | 'deleted' | 'excluded'} [type]
	 */
	constructor(name, type = 'normal') {
		//@ts-ignore
		this.#element = document.getElementById('search-tag').content.cloneNode(true).querySelector('.search-tag');

		this.#element.textContent = name;

		switch (type) {
			case 'wrong':
				this.#element.classList.add('wrong-tag');
				break;
			case 'newAdded':
				this.#element.classList.add('new-tag');
				break;
			case 'firstTime':
				this.#element.classList.add('first-time-tag');
				break;
			case 'deleted':
				this.#element.classList.add('deleted-tag');
				break;
			case 'excluded':
				this.#element.classList.add('excluded-tag');
				break;
		}
	}

	/**
	 * It returns a Tag object built from the given a search-tag HTML element,
	 * @param {HTMLElement} element
	 * @returns {Tag}
	 */
	static fromElement(element) {
		let type = Array.from(element.classList).find((className) => className !== 'search-tag');
		switch (type) {
			case 'wrong-tag':
				type = 'wrong';
				break;
			case 'new-tag':
				type = 'newAdded';
				break;
			case 'first-time-tag':
				type = 'firstTime';
				break;
			case 'deleted-tag':
				type = 'deleted';
				break;
			case 'excluded-tag':
				type = 'excluded';
				break;
			default:
				type = 'normal';
				break;
		}

		const name = element.textContent;

		// @ts-ignore
		return new Tag(name, type);
	}

	/**
	 * Returns true if otherTag has the same name and the same type as this Tag.
	 * @param {Tag} otherTag
	 * @returns {boolean}
	 */
	equals(otherTag) {
		return this.name === otherTag.name && this.type === otherTag.type;
	}

	/**
	 * Returns the tag's name.
	 * @returns {string}
	 */
	get name() {
		return this.#element.textContent;
	}

	/**
	 * Sets the given name.
	 * @param {string} newName
	 */
	set name(newName) {
		this.#element.textContent = newName;
	}

	/**
	 * Returns the tag's type
	 * @returns {'normal' | 'wrong' | 'newAdded' | 'firstTime' | 'deleted' | 'excluded'}
	 */
	get type() {
		const type = Array.from(this.#element.classList).find((className) => className !== 'search-tag');
		switch (type) {
			case 'wrong-tag':
				return 'wrong';
			case 'new-tag':
				return 'newAdded';
			case 'first-time-tag':
				return 'firstTime';
			case 'deleted-tag':
				return 'deleted';
			case 'excluded-tag':
				return 'excluded';
		}
	}

	/**
	 * Sets the tag's type.
	 * @param {'normal' | 'wrong' | 'newAdded' | 'firstTime' | 'deleted' | 'excluded'} logicNewType
	 */
	set type(logicNewType) {
		const currentType = Array.from(this.#element.classList).find((className) => className !== 'search-tag');
		let classNewType;
		switch (logicNewType) {
			case 'wrong':
				classNewType = 'wrong-tag';
				break;
			case 'newAdded':
				classNewType = 'new-tag';
				break;
			case 'firstTime':
				classNewType = 'first-time-tag';
				break;
			case 'deleted':
				classNewType = 'deleted-tag';
				break;
			case 'excluded':
				classNewType = 'excluded-tag';
				break;
			case 'normal':
				classNewType = 'normal';
				break;
		}
		this.#element.classList.replace(currentType, classNewType);
	}

	/**
	 * Returns this tag HTML element.
	 * @return {HTMLElement}
	 */
	get element() {
		return this.#element;
	}
}

export default Tag;
