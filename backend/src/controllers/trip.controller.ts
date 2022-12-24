import { NextFunction, Request, Response } from "express";
import Trip from '../models/trip.model';
import { tripSeed } from "../seeds/flight.seed";
import { HttpException } from "../middlewares/error.middleware";
import { Error } from 'mongoose';


export const seedTrips = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await Trip.deleteMany({});
    const seeds = await Trip.insertMany(tripSeed);
    res.status(201).json(seeds);
  } catch (e: any) {
    next(new HttpException(e.status, e.message));
  }
};

export const getTrip = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const flight = await Trip.findById(req.params.id).select('-__v').orFail();
    res.status(200).json(flight);
  } catch (e: any) {
    if((e as Error.DocumentNotFoundError)) {
      console.log("DocumentNotFoundError");
      return next(new HttpException(400, "Invalid TripId"))
    }
    next(new HttpException(e.status, e.message))
  }
};

export const getTrips = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const trips = await Trip.find().select('-__v');
    res.status(200).json(trips);
  } catch (e: any) {
    next(new HttpException(e.status, e.message));
  }
};
