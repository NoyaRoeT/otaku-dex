import Bookmark from "../models/bookmark.js";
import ExpressError, { errorTypes } from "../utils/ExpressError.js";
import GenreStore from "../utils/GenreStore.js";
import TagStore from "../utils/TagStore.js";
import { cloudinaryDestroy } from "../utils/imageUpload/cloudinary.js";
import mongoose from "mongoose";

export const getBookmark = async (req, res, next) => {
	const reqBookmarkId = req.params.bookmarkId;

	if (!reqBookmarkId) {
		return next(
			new ExpressError(
				"Missing bookmarkId parameter",
				errorTypes.GENERAL,
				400
			)
		);
	}

	try {
		if (!mongoose.isValidObjectId(reqBookmarkId)) {
			return next(
				new ExpressError(
					"This bookmark does not exist.",
					errorTypes.GENERAL,
					404
				)
			);
		}

		const bookmark = await Bookmark.findById(reqBookmarkId)
			.populate("genres", "name -_id")
			.populate("tags", "name -_id");

		if (!bookmark) {
			return next(
				new ExpressError(
					"This bookmark does not exist.",
					errorTypes.GENERAL,
					404
				)
			);
		}
		return res.status(200).json({
			data: {
				...bookmark.toObject(),
				genres: bookmark.genres.map((g) => g.name),
				tags: bookmark.tags.map((t) => t.name),
			},
		});
	} catch (err) {
		next(new ExpressError(err.message, 500));
	}
};

export const createBookmark = async (req, res, next) => {
	const user = req.user;
	const { title, genres, type, tags = [], rating } = req.body;
	const bookmark = new Bookmark({
		title,
		genres: genres.map((name) => GenreStore.getMap()[name]),
		type,
		tags: tags.map((name) => TagStore.getMap()[name]),
		userId: user._id,
		rating,
	});

	if (req.image) {
		bookmark.imageId = req.image.public_id;
		bookmark.imagePath = req.image.secure_url;
	} else if (req.body.imageUrl) {
		bookmark.imagePath = req.body.imageUrl;
	}

	try {
		await bookmark.save();
		return res.status(200).json({
			data: bookmark,
			message: "Successfully created the bookmark",
		});
	} catch (err) {
		next(new ExpressError(err.message, 500));
	}
};

export const updateBookmark = async (req, res, next) => {
	const reqBookmarkId = req.params.bookmarkId;
	if (!reqBookmarkId) {
		return next(
			new ExpressError(
				"Missing bookmarkId parameter",
				errorTypes.GENERAL,
				400
			)
		);
	}
	try {
		const bookmark = await Bookmark.findById(reqBookmarkId);
		if (!bookmark) {
			return next(
				new ExpressError(
					"This bookmark does not exist.",
					errorTypes.GENERAL,
					404
				)
			);
		}

		const { title, genres, type, tags = [], rating } = req.body;

		bookmark.title = title;
		bookmark.genres = genres.map((name) => GenreStore.getMap()[name]);
		bookmark.type = type;
		bookmark.tags = tags.map((name) => TagStore.getMap()[name]);
		bookmark.rating = rating;

		if (req.image || req.body.imageUrl) {
			const oldImageId = bookmark.imageId;

			bookmark.imageId = req.image ? req.image.public_id : undefined;
			bookmark.imagePath = req.image
				? req.image.secure_url
				: req.body.imageUrl;
			await bookmark.save();

			if (req.image) {
				req.image.saved = true;
			}

			if (oldImageId) {
				cloudinaryDestroy(oldImageId);
			}
		} else {
			await bookmark.save();
		}

		return res.status(200).json({
			data: bookmark,
			message: "Successfully updated the bookmark",
		});
	} catch (err) {
		next(new ExpressError(err.message, 500));
	}
};

export const deleteBookmark = async (req, res, next) => {
	const reqBookmarkId = req.params.bookmarkId;

	if (!reqBookmarkId) {
		return next(
			new ExpressError(
				"Missing bookmarkId parameter",
				errorTypes.GENERAL,
				400
			)
		);
	}

	try {
		const bookmark = await Bookmark.findById(reqBookmarkId);
		if (!bookmark) {
			return next(
				new ExpressError(
					"This bookmark does not exist",
					errorTypes.GENERAL,
					404
				)
			);
		}
		await bookmark.deleteOne();

		if (bookmark.imageId) {
			await cloudinaryDestroy(bookmark.imageId);
		}

		return res
			.status(200)
			.json({ message: "Successfully deleted this bookmark" });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const isBookmarkOwner = async (req, res, next) => {
	if (!req.params.bookmarkId) {
		return next(
			new ExpressError(
				"Missing bookmarkId parameter",
				errorTypes.GENERAL,
				400
			)
		);
	}

	try {
		if (!mongoose.isValidObjectId(req.params.bookmarkId)) {
			return next(
				new ExpressError("This bookmark does not exist.", 1, 404)
			);
		}

		const bookmark = await Bookmark.findById(req.params.bookmarkId);
		if (!bookmark) {
			return next(
				new ExpressError("This bookmark does not exist.", 1, 404)
			);
		}
		if (!req.user._id.equals(bookmark.userId)) {
			return next(
				new ExpressError(
					"Not authorized to access this bookmark.",
					1,
					401
				)
			);
		}
		next();
	} catch (err) {
		next(new ExpressError(err.message, 500));
	}
};

export const getGenres = (req, res, next) => {
	const genres = Object.keys(GenreStore.getMap());
	return res.status(200).json({ data: genres });
};

export const getTags = (req, res, next) => {
	const tags = Object.keys(TagStore.getMap());

	return res.status(200).json({ data: tags });
};

export const searchBookmarks = async (req, res, next) => {
	const filter = { userId: req.user._id };

	if (req.body.genres && req.body.genres.length) {
		filter.genres = {
			$all: req.body.genres.map((g) => GenreStore.getMap()[g]),
		};
	}

	if (req.body.tags && req.body.tags.length) {
		filter.tags = { $all: req.body.tags.map((t) => TagStore.getMap()[t]) };
	}

	if (req.body.type) {
		filter.type = req.body.type;
	}

	if (req.body.title) {
		const regex = new RegExp(req.body.title, "i");
		filter.title = { $regex: regex };
	}

	// Use in since these are boolean values
	if ("favorite" in req.body) {
		filter.favorite = req.body.favorite;
	}

	if ("archived" in req.body) {
		filter.archived = req.body.archived;
	}

	const sortCriteria = {};
	if (req.body.sortBy === "Last Added") {
		sortCriteria.createdAt = -1;
	} else if (req.body.sortBy === "Rating") {
		sortCriteria.rating = -1;
	}

	try {
		const bookmarks = await Bookmark.find(filter)
			.sort(sortCriteria)
			.populate("genres", "name -_id")
			.populate("tags", "name -_id")
			.limit(req.body.limit);

		const processedBookmarks = bookmarks.map((bookmark) => {
			return {
				...bookmark.toObject(),
				genres: bookmark.genres.map((g) => g.name),
				tags: bookmark.tags.map((t) => t.name),
			};
		});
		return res.status(200).json({ data: processedBookmarks });
	} catch (err) {
		next(new ExpressError(err.message, 500));
	}
};

export const favoriteBookmark = async (req, res, next) => {
	const reqBookmarkId = req.params.bookmarkId;

	if (!reqBookmarkId) {
		return next(
			new ExpressError(
				"Missing bookmarkId parameter",
				errorTypes.GENERAL,
				400
			)
		);
	}

	try {
		const bookmark = await Bookmark.findById(reqBookmarkId);
		if (!bookmark) {
			return next(
				new ExpressError("This bookmark does not exist.", 1, 404)
			);
		}

		bookmark.favorite = !bookmark.favorite;
		await bookmark.save();
		return res.status(200).json({
			data: bookmark.favorite,
			message: bookmark.favorite
				? "Successfully added to favorites."
				: "Successfully removed from favorites.",
		});
	} catch (err) {
		next(new ExpressError(err.message, 500));
	}
};

export const archiveBookmark = async (req, res, next) => {
	const reqBookmarkId = req.params.bookmarkId;

	if (!reqBookmarkId) {
		return next(
			new ExpressError(
				"Missing bookmarkId parameter",
				errorTypes.GENERAL,
				400
			)
		);
	}

	try {
		const bookmark = await Bookmark.findById(reqBookmarkId);
		if (!bookmark) {
			return next(
				new ExpressError("This bookmark does not exist.", 1, 404)
			);
		}

		bookmark.archived = !bookmark.archived;
		await bookmark.save();
		return res.status(200).json({
			data: bookmark.archived,
			message: bookmark.archived
				? "Successfully added to archive."
				: "Successfully restored from archive.",
		});
	} catch (err) {
		next(new ExpressError(err.message, 500));
	}
};
