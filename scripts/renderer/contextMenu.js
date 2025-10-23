class ContextMenu {
	/**
	 * Shows a context menu in the x ( in pixels) and y (in pixels) position with the specified items, which will trigger the given function when clicked.
	 * @param {number} x
	 * @param {number} y
	 * @param {({item: string, click: ()=>any, disabled?: boolean} | 'separator')[]} options
	 */
	// @ts-ignore
	static show(x, y, options) {
		// @ts-ignore
		const menuFragment = document.getElementById('context-menu').content.cloneNode(true);

		const menu = menuFragment.querySelector('.context-menu');

		// @ts-ignore
		menu.style.left = x + 'px';
		// @ts-ignore
		menu.style.top = y + 'px';

		for (const option of options) {
			const li = document.createElement('li');
			if (typeof option !== 'string') {
				li.textContent = option.item;
				li.addEventListener('click', option.click);
				if (option.disabled) li.classList.add('context-menu-disabled');
			} else {
				li.classList.add('context-menu-separator');
			}

			menu.appendChild(li);
		}

		const deleteMenu = () => {
			document.body.removeChild(menu);

			document.removeEventListener('click', deleteMenu);
			document.removeEventListener('contextmenu', deleteMenu);
			document.removeEventListener('keydown', deleteMenu);
		};

		document.addEventListener('click', deleteMenu);
		document.addEventListener('keydown', deleteMenu);
		setTimeout(() => {
			document.addEventListener('contextmenu', deleteMenu);
		});

		document.body.appendChild(menu);
	}
}

export default ContextMenu;
