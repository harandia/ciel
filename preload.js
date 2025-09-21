const { contextBridge, ipcRenderer, app } = require('electron');
const jsonIO = require('./scripts/general/jsonIO');

contextBridge.exposeInMainWorld('api', {});
