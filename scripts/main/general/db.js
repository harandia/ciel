const SQLite = require('better-sqlite3');
const path = require('node:path');

/**
 * Represents a database containing the images and their associated tags.
 * @class
 */
class Database {
	#db;

	#addImageStmt;
	#deleteImageStmt;
	#getAllImagesStmt;
	#existImageStmt;

	#addTagStmt;
	#deleteTagStmt;
	#getAllTagsStmt;
	#existTagStmt;

	#addImageTagStmt;
	#deleteImageTagStmt;
	#getAllImageTagsStmt;
	#getAllImagesTaggedStmt;
	#existImageTagStmt;

	/**
	 * Builds a Database object. If dbPath is found it will open the database, it will be created otherwise.
	 * @param {string} dbPath
	 */
	constructor(dbPath) {
		this.#db = new SQLite(dbPath);

		this.#db
			.prepare(
				`CREATE TABLE IF NOT EXISTS image (
                name TEXT PRIMARY KEY
            )`,
			)
			.run();
		this.#db
			.prepare(
				`CREATE TABLE IF NOT EXISTS tag (
            name TEXT PRIMARY KEY
            )`,
			)
			.run();
		this.#db
			.prepare(
				`CREATE TABLE IF NOT EXISTS image_tag (
            image TEXT,
            tag TEXT,
            PRIMARY KEY(image, tag),
            FOREIGN KEY (image) references image(name)
                ON UPDATE CASCADE
                ON DELETE CASCADE,
            FOREIGN KEY (tag) references tag(name)
                ON UPDATE CASCADE
                ON DELETE CASCADE
            )`,
			)
			.run();

		this.#addImageStmt = this.#db.prepare(`INSERT OR IGNORE INTO image (name) VALUES (?)`);
		this.#deleteImageStmt = this.#db.prepare(`DELETE FROM image WHERE name = ?`);
		this.#getAllImagesStmt = this.#db.prepare(`SELECT * FROM image`);
		this.#existImageStmt = this.#db.prepare(`SELECT 1 FROM image WHERE name = ?`);

		this.#addTagStmt = this.#db.prepare(`INSERT OR IGNORE INTO tag (name) VALUES (?)`);
		this.#deleteTagStmt = this.#db.prepare(`DELETE FROM tag WHERE name = ?`);
		this.#getAllTagsStmt = this.#db.prepare(`SELECT * FROM tag`);
		this.#existTagStmt = this.#db.prepare(`SELECT 1 FROM tag WHERE name = ?`);

		this.#addImageTagStmt = this.#db.prepare(`INSERT OR IGNORE INTO image_tag (image, tag) VALUES (?, ?)`);
		this.#deleteImageTagStmt = this.#db.prepare(`DELETE FROM image_tag WHERE image = ? AND tag = ?`);
		this.#getAllImageTagsStmt = this.#db.prepare(`SELECT tag FROM image_tag WHERE image = ?`);
		this.#getAllImagesTaggedStmt = this.#db.prepare(`SELECT image FROM image_tag WHERE tag = ?`);
		this.#existImageTagStmt = this.#db.prepare(`SELECT 1 FROM image_tag WHERE image = ? AND tag = ?`);
	}

	/**
	 * Adds a new image to the database.
	 * @param {string} name
	 */
	addImage(name) {
		try {
			this.#addImageStmt.run(name);
		} catch (err) {
			throw err;
		}
	}

	/**
	 * Deletes an image from the databse.
	 * @param {string} name
	 */
	deleteImage(name) {
		try {
			this.#deleteImageStmt.run(name);
		} catch (err) {
			throw err;
		}
	}

	/**
	 * Returns all the images of the database.
	 * @returns {string[]}
	 */
	getAllImages() {
		try {
			// @ts-ignore
			return this.#getAllImagesStmt.all().map(({ name }) => name);
		} catch (err) {
			throw err;
		}
	}

	/**
	 * Returns true if the specified image exists in the database.
	 * @param {string} name
	 * @returns {boolean}
	 */
	existImage(name) {
		try {
			return this.#existImageStmt.get(name) !== undefined;
		} catch (err) {
			throw err;
		}
	}

	/**
	 * Adds a new tag to the database.
	 * @param {string} name
	 */
	addTag(name) {
		try {
			this.#addTagStmt.run(name);
		} catch (err) {
			throw err;
		}
	}

	/**
	 * Deletes the tag of the database.
	 * @param {string} name
	 */
	deleteTag(name) {
		try {
			this.#deleteTagStmt.run(name);
		} catch (err) {
			throw err;
		}
	}

	/**
	 * Returns all the tag names in the database.
	 * @returns {string[]}
	 */
	getAllTags() {
		try {
			// @ts-ignore
			return this.#getAllTagsStmt.all().map(({ name }) => name);
		} catch (err) {
			throw err;
		}
	}

	/**
	 * Returns true if the specified tag exists in the database.
	 * @param {string} name
	 * @returns {boolean}
	 */
	existTag(name) {
		try {
			return this.#existTagStmt.get(name) !== undefined;
		} catch (err) {
			throw err;
		}
	}

	/**
	 * Associates an existing tag with an existing image.
	 * @param {string} image
	 * @param {string} tag
	 */
	addImageTag(image, tag) {
		try {
			this.#addImageTagStmt.run(image, tag);
		} catch (err) {
			throw err;
		}
	}

	/**
	 * Deletes the association between the tag and the image.
	 * @param {string} image
	 * @param {string} tag
	 */
	deleteImageTag(image, tag) {
		try {
			this.#deleteImageTagStmt.run(image, tag);
		} catch (err) {
			throw err;
		}
	}

	/**
	 * Returns all the image's associated tags.
	 * @param {string} image
	 * @returns {string[]}
	 */
	getAllImageTags(image) {
		try {
			// @ts-ignore
			return this.#getAllImageTagsStmt.all(image).map(({ tag }) => tag);
		} catch (err) {
			throw err;
		}
	}

	/**
	 * Returns all the images associated with tag.
	 * @param {string | string[]} tag
	 * @returns {string[]}
	 */
	getAllTaggedImages(tag) {
		try {
			if (tag.constructor === Array) {
				const stmtString = `SELECT image
				FROM image_tag
				WHERE tag IN (${Array(tag.length).fill('?').join(',')})
				GROUP BY image
				HAVING COUNT(*) = ?`;
				return (
					this.#db
						.prepare(stmtString)
						.all(...tag, tag.length)
						// @ts-ignore
						.map(({ image }) => image)
				);
			}
			// @ts-ignore
			return this.#getAllImagesTaggedStmt.all(tag).map(({ image }) => image);
		} catch (err) {
			throw err;
		}
	}

	/**
	 * Returns true if there is an association between the tag and the image.
	 * @param {string} image
	 * @param {string} tag
	 * @returns
	 */
	existImageTag(image, tag) {
		try {
			return this.#existImageTagStmt.get(image, tag) !== undefined;
		} catch (err) {
			throw err;
		}
	}
}

module.exports = Database;
