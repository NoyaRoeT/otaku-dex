import Bookmark from "../models/bookmark.js";
import mongoose from "mongoose";

import dotenv from "dotenv";
import Genre from "../models/genre.js";
import Tag from "../models/tag.js";

if (process.env.NODE_ENV !== "production") {
	dotenv.config();
}

mongoose
	.connect(process.env.MONGO_URL)
	.then(() => {
		console.log("Connected to database");
	})
	.catch((err) => console.log(err));

async function seedGenreCollection() {
	const genreNames = [
		"Action",
		"Adult",
		"Adventure",
		"Comedy",
		"Drama",
		"Ecchi",
		"Fantasy",
		"Gender Bender",
		"Harem",
		"Historical",
		"Horror",
		"Josei",
		"Martial Arts",
		"Mature",
		"Mecha",
		"Mystery",
		"Psychological",
		"Romance",
		"School Life",
		"Sci-fi",
		"Seinen",
		"Shoujo",
		"Shoujo Ai",
		"Shounen",
		"Shounen Ai",
		"Slice of Life",
		"Smut",
		"Sports",
		"Supernatural",
		"Tragedy",
		"Wuxia",
		"Xianxia",
		"Xuanhuan",
		"Yaoi",
		"Yuri",
	];
	const genreObjs = genreNames.map((name) => {
		return { name };
	});
	await Genre.deleteMany({});
	await Genre.insertMany(genreObjs);
}

async function seedTagCollection() {
	const tagNames = [
		"Isekai",
		"Regression",
		"Magic",
		"Beautiful Female Lead",
		"Broken Engagement",
		"Female Protagonist",
		"Male Protagonist",
		"Hiding True Identity",
		"Hiding True Abilities",
		"Loyal Subordinates",
		"Strong Protagonist",
		"Overpowered Protagonist",
		"Strong to Stronger",
		"Weak to Strong",
		"Genius Protagonist",
		"Arranged Marriage",
		"Underestimated Protagonist",
		"Devils",
		"Character Death",
		"Non-human Protagonist",
		"Beautiful Visuals",
		"Demon Lord",
		"Demons",
		"Gods",
		"Divine Protection",
		"Transmigration",
		"Sword and Magic",
		"Game Elements",
		"Hunters",
		"Modern Day",
		"Shameless Protagonist",
		"Lazy Protagonist",
		"Dragons",
	];
	const tagObjs = tagNames.map((name) => {
		return { name };
	});
	await Tag.deleteMany({});
	await Tag.insertMany(tagObjs);
}

await seedTagCollection();
await seedGenreCollection();
