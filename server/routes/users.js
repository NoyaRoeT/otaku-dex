import express from "express";

import { getUser, updateUser } from "../controllers/users.js";
import { isUser } from "../controllers/middleware.js";

const router = express.Router();

router.get("/:userId", getUser);

router.put("/:userId", isUser, updateUser);

export default router;