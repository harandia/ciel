class Tag {
	/** @type {Element} */
	#element;

	/**
	 * Builds a Tag object.
	 * If param is a tag element in the DOM, no more parameters should be given, the Tag object will be built from the given search-tag HTML element
	 * If param is the name of the tag, you can specify the type or use the default (normal).
	 * @param {string | Element} param
	 * @param {'normal' | 'wrong' | 'newAdded' | 'firstTime' | 'deleted' | 'excluded'} [type]
	 */
	constructor(param, type = 'normal') {
		if (param instanceof Element) {
			this.#element = param;
			return;
		}

		//@ts-ignore
		this.#element = document.getElementById('search-tag').content.cloneNode(true).querySelector('.search-tag');

		this.#element.textContent = param;

		switch (type) {
			case 'wrong':
				this.#element.classList.add('wrong-tag');
				break;
			case 'newAdded':
				this.#element.classList.add('new-tag');
				break;
			case 'firstTime':
				this.#element.classList.add('first-time-tag', 'new-tag');
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
	 * It returns a Tag object built from the given a search-tag HTML element.
	 * @param {HTMLElement} element
	 * @returns {Tag}
	 */
	static fromElement(element) {
		return new Tag(element);
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
			default:
				return 'normal';
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
				classNewType = ['first-time-tag', 'newTag'];
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
		if (currentType) {
			if (typeof classNewType === 'string') {
				this.#element.classList.replace(currentType, classNewType);
			} else {
				this.#element.classList.remove(currentType);
				this.#element.classList.add(classNewType[0], classNewType[1]);
			}
		} else {
			if (typeof classNewType === 'string') {
				this.#element.classList.add(classNewType);
			} else {
				this.#element.classList.add(classNewType[0], classNewType[1]);
			}
		}
	}

	/**
	 * Returns this tag HTML element.
	 * @return {Element}
	 */
	get element() {
		return this.#element;
	}
}

export default Tag;
