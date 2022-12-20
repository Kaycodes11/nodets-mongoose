import express, { NextFunction } from "express";
import * as Auth from "../controllers/auth.controller";
import passport from "passport";
import { verifyAccessTokenToAuthenticate, verifyRefreshToken } from '../middlewares/verifyToken.middleware';

const router = express.Router();

// seed users

router.post("/register", Auth.registerWithEmailOrMobile);

router.post("/verify", Auth.verify);

router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  Auth.login
);

router.post("/refresh", verifyRefreshToken, Auth.refreshToken);

router.get("/protected", verifyAccessTokenToAuthenticate, Auth.test);

router.put("/reset", Auth.reset);

router.post("/login/social", Auth.socialLogin);

export default router;
