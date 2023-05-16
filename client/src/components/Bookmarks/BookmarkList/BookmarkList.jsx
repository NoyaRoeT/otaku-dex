import React from "react";
import BookmarkCard from "../BookmarkCard/BookmarkCard";
import { Grid } from "@mui/material";

const BookmarkList = ({ bookmarks }) => {
	return (
		<Grid container>
			{bookmarks.map((bookmark, i) => {
				return <BookmarkCard bookmark={bookmark} />;
			})}
		</Grid>
	);
};

export default BookmarkList;
