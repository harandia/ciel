const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

const path = require('node:path');

module.exports = {
	packagerConfig: {
		asar: true,
		icon: path.join(__dirname, 'resources', 'app-logo', 'app-logo.ico'),
		win32metadata: {
			icon: path.join(__dirname, 'resources', 'app-logo', 'app-logo.ico'),
			AppUserModelId: 'com.harandia.ciel',
		},
	},
	rebuildConfig: {},
	makers: [
		{
			name: '@electron-forge/maker-squirrel',
			config: {
				name: 'ciel',
				setupIcon: path.join(__dirname, 'resources', 'app-logo', 'app-logo.ico'),
				shortcutName: 'ciel',
			},
		},
		{
			name: '@electron-forge/maker-zip',
			platforms: ['darwin'],
		},
		{
			name: '@electron-forge/maker-deb',
			config: {
				maintainer: 'Hugo Arandia<hugo.arandia.t@gmail.com>',
				icon: path.join(__dirname, 'resources', 'app-logo', '1024x1024.png'),
			},
		},
	],
	plugins: [
		{
			name: '@electron-forge/plugin-auto-unpack-natives',
			config: {},
		},
		// Fuses are used to enable/disable various Electron functionality
		// at package time, before code signing the application
		new FusesPlugin({
			version: FuseVersion.V1,
			[FuseV1Options.RunAsNode]: false,
			[FuseV1Options.EnableCookieEncryption]: true,
			[FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
			[FuseV1Options.EnableNodeCliInspectArguments]: false,
			[FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
			[FuseV1Options.OnlyLoadAppFromAsar]: true,
		}),
	],
};
