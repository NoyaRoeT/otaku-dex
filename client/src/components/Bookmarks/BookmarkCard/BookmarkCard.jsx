import React from "react";
import {
	Grid,
	Typography,
	Card,
	CardMedia,
	CardContent,
	CardActionArea,
} from "@mui/material";

const BookmarkCard = ({ bookmark }) => {
	return (
		<Grid
			sx={{
				textAlign: "center",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				p: "15px",
			}}
			item
			xs={12}
			sm={6}
			md={4}
			lg={3}
			xl={12 / 5}
		>
			<Card
				sx={{
					":hover": {
						boxShadow: 5,
						transform: "scale(1.05)",
						zIndex: 100,
					},
					borderRadius: 2,
					maxWidth: 220,
					position: "relative",
					width: 1,
				}}
			>
				<CardMedia
					sx={{ height: 300 }}
					image="https://via.placeholder.com/400"
				/>
				<CardContent
					sx={{
						zIndex: 2,
						position: "absolute",
						bottom: 0,
						left: 0,
						right: 0,
						bgcolor: "grey.700",
						px: "24px",
						"&:last-child": {
							pb: "12px",
						},
					}}
				>
					<Typography
						sx={{
							color: "#f0f0f0",
							textTransform: "uppercase",
							letterSpacing: "2",
						}}
						variant="body2"
					>
						Manga
					</Typography>
					<Typography
						sx={{ color: "#f9d3b4", fontSize: "18px" }}
						noWrap
						variant="h6"
					>
						Tensei Shitara Slime Datta Ken
					</Typography>
				</CardContent>
			</Card>
		</Grid>
	);
};

export default BookmarkCard;
