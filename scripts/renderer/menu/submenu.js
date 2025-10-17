/**
 * Represents a generic submenu.
 */
class Submenu {
	/**@param {string} id */
	constructor(id) {
		this.element = document.querySelector(id);
	}

	/**
	 * Shows the submenu in the document.
	 */
	open() {
		if (this.element !== null) this.element.classList.remove('submenu-hidden');
	}

	/**
	 * Hides the submenu in the document.
	 */
	hide() {
		if (this.element !== null) this.element.classList.add('submenu-hidden');
	}

	/**
	 * Returns true if the submenu is hidden.
	 */
	get isHidden() {
		return this.element.classList.contains('submenu-hidden');
	}
}

export default Submenu;
