import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			minLength: 1,
			maxLength: 200,
		},
		genres: {
			type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Genre" }],
			required: true,
		},
		tags: {
			type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
			default: [],
		},
		type: {
			type: String,
			required: true,
			enum: ["Anime", "Manga", "Manhwa", "Manhua", "Novel"],
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		imagePath: {
			type: String,
		},
		imageId: {
			type: String,
		},
		rating: {
			type: Number,
			default: 0,
			min: [0, "Rating cannot be below 0"],
			max: [5, "Rating cannot be above 5"],
		},
		favorite: {
			type: Boolean,
			default: false,
		},
		archived: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

bookmarkSchema.path("title").validate((val) => {
	// Only alphanum + some puncutations
	const regex = /^[a-z0-9 "'!?,.]+$/i;
	return regex.test(val);
});

bookmarkSchema.path("genres").validate((val) => {
	// Should not have duplicate genres
	const uniqueGenreIds = new Set(val.map((id) => id.toString()));
	return (
		val.length >= 1 && val.length <= 5 && uniqueGenreIds.size == val.length
	);
});

bookmarkSchema.path("tags").validate((val) => {
	// Should not have duplicate tags
	if (val.length === 0) {
		return true;
	}
	const uniqueTagIds = new Set(val.map((id) => id.toString()));
	return val.length <= 20 && uniqueTagIds.size == val.length;
});

bookmarkSchema.path("rating").validate((val) => {
	// Validate against 0.5 incremental
	return 2 * val == Math.round(2 * val);
});

bookmarkSchema.index({ title: 1, userId: 1 }, { unique: true });

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
export default Bookmark;
