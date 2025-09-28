const { BrowserWindow, app, ipcMain } = require('electron');
const path = require('node:path');

const startTestDatabase = require('./test/dbTest.js');
const settings = require('./scripts/main/settings.js');

function createWindow() {
	const win = new BrowserWindow({
		title: 'ciel',
		icon: path.join(__dirname, 'icon', 'ciel-logo.png'),
		width: 1000,
		height: 500,

		minHeight: 800,
		minWidth: 500,

		show: false,

		webPreferences: {
			preload: path.join(app.getAppPath(), 'preload.js'),
		},
	});

	win.maximize();

	win.loadFile('index.html');

	win.once('ready-to-show', () => {
		win.show();
	});
}

app.whenReady().then(() => {
	ipcMain.handle('get-settings', async () => {
		return (await settings.init()).properties;
	});

	ipcMain.on('update-settings', (event, config) => {
		Object.assign(settings, config);
	});

	startTestDatabase(path.join(app.getPath('userData'), 'test.db'));

	createWindow();
});

app.addListener('quit', () => {
	settings.writeConfig();
});
