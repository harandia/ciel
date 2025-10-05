import Editor from './components/editor.js';
import ImageGrid from './components/imageGrid.js';

class UploadPage {
	/** @type {ImageGrid} */
	#imageGrid;

	/** @type {Editor} */
	#editor;

	/** @type {HTMLElement[]} */
	#elements;

	constructor() {
		//@ts-ignore
		const pageFragment = document.getElementById('upload-page').content.cloneNode(true);

		this.#elements = Array.from(pageFragment.children);

		this.#imageGrid = new ImageGrid(pageFragment.querySelector('.image-grid'));
		this.#editor = new Editor(pageFragment.querySelector('.editor'));
	}

	/**
	 * Renders the page.
	 */
	render() {
		this.derender();
		for (const element of this.#elements) {
			document.querySelector('main').appendChild(element);
		}
	}

	/**
	 * Unrenders the page.
	 */
	derender() {
		const main = document.querySelector('main');
		for (const child of Array.from(main.children)) {
			// @ts-ignore
			if (this.#elements.includes(child)) main.removeChild(child);
		}
	}

	addEventListener(eventType, callback) {}

	removeEventListener(eventType, callback) {}
}

export default UploadPage;
