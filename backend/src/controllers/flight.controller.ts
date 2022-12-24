// based on trip search info, find
import { NextFunction, Request, Response } from "express";

// Find Flight(s) based on the given trip info
export const getFlights = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const updatedFlight = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // maybe changing date or cancelling
};
