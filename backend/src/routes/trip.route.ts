import express, { Request, Response } from "express";
import * as TripController from "../controllers/trip.controller";

const router = express.Router();

router.get("/", TripController.getTrips);

router.get("/:id", TripController.getTrip);

router.post("/seed", TripController.seedTrips);

export default router;
