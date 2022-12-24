import { Router } from "express";
import AuthRoutes from "./auth.route";
import UserRoutes from './user.route';
import TripRoutes from './trip.route';
import FlightRoutes from './flight.route';

const router = Router();

router.use("/api/auth", AuthRoutes);
router.use("/api/user", UserRoutes);
router.use("/api/trip", TripRoutes);
router.use("/api/flight", FlightRoutes);

export default router;
