import Genre from "../models/genre.js";

const GenreStore = (() => {
	const genreMap = {};

	return {
		init: () => {
			console.log("Initialising GenreStore");
			Genre.find({}).then((genres) => {
				GenreStore.addAll(...genres);
			});
		},
		getMap: () => genreMap,
		add: (genre) => {
			genreMap[genre.name] = genre.id;
		},
		addAll: function () {
			for (let i = 0; i != arguments.length; ++i) {
				const arg = arguments[i];
				genreMap[arg.name] = arg.id;
			}
		},
	};
})();

export default GenreStore;
