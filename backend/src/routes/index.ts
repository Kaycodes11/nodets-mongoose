import { Router } from "express";
import AuthRoutes from "./auth.route";
import UserRoutes from './user.route';

const router = Router();

router.use("/api/auth", AuthRoutes);
router.use("/api/user", UserRoutes);

export default router;
