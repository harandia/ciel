const keysDown = new Set();

document.addEventListener('keydown', (event) => {
	keysDown.add(event.key);
});

document.addEventListener('keyup', (event) => {
	keysDown.delete(event.key);
});

window.addEventListener('blur', () => {
	keysDown.clear();
});

export default keysDown;
