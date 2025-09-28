//@ts-nocheck

const fadeDuration = 220; //ms
document.documentElement.style.setProperty('--tooltip-fade-duration', fadeDuration + 'ms');

/**
 * Represents an abstract tooltip.
 * @class
 * @abstract
 */
class Tooltip {
	/** @type {HTMLElement} */
	_tooltipElement;

	/**
	 * Makes the tooltip visible with the given message with a specified delay in ms (default is 0ms). If the tooltip is already
	 * visible, it will change the message displayed.
	 * @param {string} message
	 * @param {number} delay
	 */
	show(message, delay = 0) {
		if (!this._tooltipElement) {
			this._tooltipElement = this._newTooltipElement();
			document.body.appendChild(this._tooltipElement);
		}

		this._tooltipElement.textContent = message;
		this._tooltipElement.style.setProperty('--tooltip-delay', delay + 'ms');
		setTimeout(() => {
			this._tooltipElement.classList.replace('tooltip-hidden', 'tooltip-visible');
		}, 0);
	}

	/**
	 * Hides the tooltip.
	 */
	hide() {
		if (!this._tooltipElement) return;

		setTimeout(() => {
			this._tooltipElement.classList.replace('tooltip-visible', 'tooltip-hidden');
		}, 0);
	}

	/**
	 * Creates a new tooltip element.
	 * @abstract
	 */
	_newTooltipElement() {}
}

/**
 * Represents an absolute-positioned tooltip.
 * @class
 */
class AbsoluteTooltip extends Tooltip {
	/** @type {number} */
	#x;
	/** @type {number} */
	#y;

	/**
	 * Creates a new tooltip in the given position.
	 * @param {number} x
	 * @param {number} y
	 */
	constructor(x, y) {
		super();
		this.#x = x;
		this.#y = y;
	}

	/**
	 * Creates a new tooltip element in the DOM, with the tooltip's position.
	 * @returns {HTMLElement}
	 */
	_newTooltipElement() {
		const tooltipTempl = document.getElementById('tooltip');
		const tooltipElement = tooltipTempl.content.cloneNode(true).querySelector('.tooltip-hidden');

		tooltipElement.style.left = this.#x + 'px';
		tooltipElement.style.top = this.#y + 'px';

		return tooltipElement;
	}

	get x() {
		return this.#x;
	}

	set x(x) {
		this.#x = x;
		if (this._tooltipElement) {
			this._tooltipElement.style.left = this.#x + 'px';
		}
	}

	get y() {
		return this.#y;
	}

	set y(y) {
		this.#y = y;
		if (this._tooltipElement) {
			this._tooltipElement.style.top = this.#y + 'px';
		}
	}
}

/**
 * Represents a tooltip that will follow the cursor's movement.
 * @class
 */
class StickyTooltip extends Tooltip {
	#repositionFunc;

	/**
	 * Creates a new tooltip element in the DOM that will follow the cursor.
	 * @returns {HTMLElement}
	 */
	_newTooltipElement() {
		const tooltipTempl = document.getElementById('tooltip');
		const tooltipElement = tooltipTempl.content.cloneNode(true).querySelector('.tooltip-hidden');
		document.body.appendChild(tooltipElement);

		this.#repositionFunc = (event) => {
			tooltipElement.style.left = event.clientX + 9 + 'px';
			tooltipElement.style.top = event.clientY + 'px';
		};

		document.addEventListener('mousemove', this.#repositionFunc);

		return tooltipElement;
	}

	/**
	 * Hides the tooltip.
	 */
	hide() {
		super.hide();
	}
}

export { AbsoluteTooltip, StickyTooltip };
