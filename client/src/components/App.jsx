import React, { useContext, useEffect, useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { BookmarkInfo, Login, Bookmarks, NavBar, SignUp } from ".";
import { checkAuth } from "../services/bookmarks";
import { AuthContext } from "../store/context";

const App = () => {
	const navigate = useNavigate();
	const ctx = useContext(AuthContext);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);

	useEffect(() => {
		async function isAuthenticated() {
			const authStatus = await checkAuth();
			ctx.setIsAuthenticated(authStatus);
			setIsCheckingAuth(false);
		}
		if (!isCheckingAuth && !ctx.isAuthenticated) {
			navigate("/login");
		} else {
			isAuthenticated();
		}
	}, [isCheckingAuth]);

	return (
		<>
			<CssBaseline />
			{!isCheckingAuth && (
				<>
					<NavBar />
					<Box
						component="main"
						sx={{
							ml: { sm: "240px" },
							width: { sm: `calc(100% - 240px)` },
						}}
					>
						<Routes>
							<Route exact path="/" element={<Bookmarks />} />
							{!ctx.isAuthenticated && (
								<Route
									exact
									path="/login"
									element={<Login />}
								/>
							)}
							<Route exact path="/signup" element={<SignUp />} />
							<Route
								exact
								path="/bookmark/:bookmarkId"
								element={<BookmarkInfo />}
							/>
							<Route
								path="*"
								element={<Navigate to="/" replace />}
							/>
						</Routes>
					</Box>
				</>
			)}
		</>
	);
};
export default App;
