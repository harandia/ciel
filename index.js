const { BrowserWindow, app, ipcMain, dialog, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

const startTestDatabase = require('./test/dbTest.js');
const settings = require('./scripts/main/settings.js');

const Database = require('./scripts/main/general/db.js');

function createWindow() {
	return new BrowserWindow({
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
}

app.whenReady().then(() => {
	const db = new Database(path.join(app.getPath('userData'), 'data.db'));
	startTestDatabase(db);

	const win = createWindow();

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

	ipcMain.handle('delete-image', async (event, imagePath) => {
		console.log(imagePath);
		if (typeof imagePath === 'string') imagePath = [imagePath];

		const imageIds = imagePath.map((imagePath) => path.basename(imagePath));

		let message = 'Are you sure you want to delete this image?';
		if (imageIds.length > 1) message = 'Are you sure you want to delete this selection of images?';

		const choice = dialog.showMessageBoxSync(win, { title: 'Warning', message, type: 'warning', buttons: ['Yes', 'Cancel'], defaultId: 0 });

		switch (choice) {
			case 0:
				for (const image of imageIds) {
					console.log(image);
					if (await fs.unlink(path.join(app.getPath('userData'), 'images', image))) {
						dialog.showErrorBox('Error', 'Image could not be deleted.');
						return;
					}
					db.deleteImage(image);
				}
				return true;
			case 1:
				return false;
		}
	});

	ipcMain.on('open-image', async (event, imagePath) => {
		const imageId = path.basename(imagePath);

		const error = await shell.openPath(path.join(app.getPath('userData'), 'images', imageId));

		if (error) {
			dialog.showErrorBox('Error', `Couldn't open the file: ${error}`);
		}
	});

	ipcMain.on('update-image', (event, imagePath, changes) => {
		const imageId = path.basename(imagePath);

		const { addedTags, deletedTags } = changes;

		for (const tag of addedTags) {
			if (!db.existTag(tag)) db.addTag(tag);
			db.addImageTag(imageId, tag);
		}

		for (const tag of deletedTags) {
			db.deleteImageTag(imageId, tag);
		}

		for (const tag of deletedTags) {
			if (!db.getAllTaggedImages(tag)) db.deleteTag(tag);
		}
	});

	win.maximize();

	win.loadFile('index.html');

	win.once('ready-to-show', () => {
		win.show();
	});
});

app.addListener('quit', () => {
	settings.writeConfig();
});
