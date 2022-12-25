import { Router } from 'express';
import * as FlightController from "../controllers/flight.controller";

const router = Router();

// Find & filter Flight(s) based on the given trip info
router.get("/", FlightController.getFlights);

router.put("/:id", FlightController.updateFlight);

export default router