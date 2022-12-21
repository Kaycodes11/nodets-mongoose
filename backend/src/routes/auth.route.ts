import express from "express";
import * as Auth from "../controllers/auth.controller";
import passport from "passport";
import {
  removeToken,
  verifyAccessTokenToAuthenticate,
  verifyRefreshToken,
} from "../middlewares/verifyToken.middleware";

const router = express.Router();

// @protected
router.post("/register", Auth.registerWithEmailOrMobile);

// @public
router.post("/verify", Auth.verifyMail);

// @public
router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  Auth.login
);

// @protected
router.post("/refresh", verifyRefreshToken, Auth.refreshToken);

// @protected
router.get("/protected", verifyAccessTokenToAuthenticate, Auth.test);

// @protected
router.put("/reset", Auth.reset);

// @protected
router.delete(
  "/logout",
  verifyAccessTokenToAuthenticate,
  removeToken,
  Auth.logout
);

router.post("/login/social", Auth.socialLogin);

// @protected : remove the unused token when necessary perhaps by using something like cron jobs or manually
router.get("/invalidate/tokens/:userId", Auth.invalidateTokens);

export default router;
