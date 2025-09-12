const { BrowserWindow, app, Menu } = require('electron');
const path = require('node:path');

function createWindow() {
	const win = new BrowserWindow({
		title: 'ciel',
		icon: path.join(__dirname, 'icon', 'ciel-logo.png'),
		width: 1000,
		height: 500,

		minHeight: 800,
		minWidth: 500,

		show: false,
	});

	win.maximize();
	// Menu.setApplicationMenu(null);

	win.loadFile('index.html');

	win.once('ready-to-show', () => {
		win.show();
	});
}

app.whenReady().then(() => {
	createWindow();
});
