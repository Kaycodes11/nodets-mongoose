import { FareType, ITrip, TripType } from "../models/trip.model";


export const tripSeed: Partial<ITrip>[] = [
  {
    to: "Bangalore",
    from: "Kolkata",
    tripType: TripType.OneWay,
    fareType: FareType.REGULAR_FARE,
    type: "Domestic",
    travelClass: "Business",
  },

  {
    to: "Hyderabad",
    from: "Bangalore",
    tripType: TripType.RoundTrip,
    fareType: FareType.REGULAR_FARE,
    type: "Domestic",
    travelClass: "Economy",
  },
];
