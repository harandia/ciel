import OpenSearchPage from './openSearchPage.js';

class AllImagesSearchPage extends OpenSearchPage {
	constructor() {
		super();

		window.app.getAllImages().then((images) => {
			this._imageGrid.showImages(images);
		});
	}
}

export default AllImagesSearchPage;
