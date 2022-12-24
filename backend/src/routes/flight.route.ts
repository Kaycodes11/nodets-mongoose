import { Router } from 'express';
import * as FlightController from "../controllers/flight.controller";

const router = Router();

router.get("/", FlightController.getFlights);
router.put("/:id", FlightController.updatedFlight);

export default router