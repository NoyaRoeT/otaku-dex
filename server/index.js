import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
	dotenv.config();
}

import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import LocalStrategy from "passport-local";
import MongoStore from "connect-mongo";

import authRouter from "./routes/auth.js";
import userRouter from "./routes/users.js";

import User from "./models/user.js";

/* CONFIGURATIONS */
const app = express();
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(
	helmet({
		crossOriginResourcePolicy: { policy: "cross-origin" },
	})
);
app.use(morgan("common"));

/* SESSION SETUP */
mongoose.set("strictQuery", false);
const sessionStore = MongoStore.create({ mongoUrl: process.env.MONGO_URL });
app.use(
	session({
		secret: process.env.SECRET || "test",
		resave: false,
		saveUninitialized: true,
		store: sessionStore,
		cookie: {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24,
		},
	})
);

/* PASSPORT */
passport.use(
	new LocalStrategy({ usernameField: "email" }, User.authenticate())
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(passport.initialize());
app.use(passport.session());

/* ROUTES */
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use((err, req, res, next) => {
	res.status(err.status).json({
		error: { message: err.message },
		status: err.status,
	});
});

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose
	.connect(process.env.MONGO_URL)
	.then(() => {
		app.listen(PORT, () =>
			console.log(`Server listening on port: ${PORT}`)
		);
	})
	.catch((err) => console.log(err));
