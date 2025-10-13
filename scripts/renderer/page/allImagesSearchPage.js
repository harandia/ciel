import ClosedAllImagesSearchPage from './closedAllImagesSearchPage.js';
import OpenSearchPage from './openSearchPage.js';

class AllImagesSearchPage extends OpenSearchPage {
	constructor() {
		super();

		window.app.getAllImages().then((images) => {
			this._imageGrid.showImages(images);
		});
	}

	close() {
		const closedPage = new ClosedAllImagesSearchPage();

		for (const func of this._onClose) func(closedPage);

		return closedPage;
	}
}

export { AllImagesSearchPage };
