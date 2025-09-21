import Submenu from './submenu.js';

class Settings extends Submenu {
	constructor(id) {
		super(id);
	}
}

const settings = new Submenu('#settings-menu');

export default settings;
