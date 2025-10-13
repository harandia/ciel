const { BrowserWindow, app, ipcMain } = require('electron');
const path = require('node:path');

const startTestDatabase = require('./test/dbTest.js');
const settings = require('./scripts/main/settings.js');

const Database = require('./scripts/main/general/db.js');

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
	const db = new Database(path.join(app.getPath('userData'), 'data.db'));
	startTestDatabase(db);

	ipcMain.handle('get-settings', async () => {
		return (await settings.init()).properties;
	});

	ipcMain.on('update-settings', (event, config) => {
		Object.assign(settings, config);
	});

	ipcMain.handle('exist-tag', async (event, tag) => {
		return db.existTag(tag);
	});

	ipcMain.handle('all-tags', () => {
		return db.getAllTags();
	});

	ipcMain.handle('search-image', (event, searchTags, excludedTags) => {
		const imageFiles = db.getAllTaggedImages(searchTags, excludedTags);
		const imageCompletePaths = imageFiles.map((file) => path.join(app.getPath('userData'), 'images', file));
		return imageCompletePaths;
	});

	ipcMain.handle('all-images', () => {
		const imageFiles = db.getAllImages();
		const imageCompletePaths = imageFiles.map((file) => path.join(app.getPath('userData'), 'images', file));
		return imageCompletePaths;
	});

	ipcMain.handle('image-tags', (event, imagePath) => {
		const imageId = path.basename(imagePath);
		return db.getAllImageTags(imageId);
	});

	createWindow();
});

app.addListener('quit', () => {
	settings.writeConfig();
});
