import { model, Schema } from "mongoose";
import moment from "moment/moment";

export enum FareType {
  REGULAR_FARE,
  ARMED_FORCES_FARE,
  STUDENT_FARE,
  SENIOR_CITIZEN_FARE,
  DOCTOR_NURSE_FARE,
  DOUBLE_SEAT_FARE,
}
export enum TripType {
  OneWay,
  RoundTrip,
  MultiCity,
}

export interface ITrip {
  from: string;
  to: string;
  departureDate: Date;
  returnDate?: Date;
  travellingAdults: number;
  travellingChildren: number;
  travellingInfants: number;
  travelClass: "Economy" | "Premium Economy" | "Business" | null;
  type: "Domestic" | "International";
  fareType: FareType | null;
  tripType: TripType | null;
}

const TripSchema = new Schema<ITrip>(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    departureDate: { type: Date, default: new Date() },
    returnDate: {
      type: Date,
      default: new Date(new Date(new Date()).setDate(new Date().getDate() + 2)),
    },
    travellingChildren: { type: Number, default: 0 },
    travellingAdults: { type: Number, default: 0 },
    travellingInfants: { type: Number, default: 0 },
    travelClass: { type: String, default: null, lowercase: true, trim: true },
    type: { type: String, lowercase: true, trim: true, default: "Domestic" },
    fareType: { type: String, enum: FareType, default: FareType.REGULAR_FARE },
    tripType: { type: String, enum: TripType },
  },
  { timestamps: true, toJSON: { virtuals: true, getters: true } }
);

TripSchema.virtual("unixTimestamps").get(function () {
  return {
    departure_at: moment(this.get("departureDate")).unix(),
    returned_at: moment(this.get("returnDate")).unix(),
  };
});

const Trip = model<ITrip>("Trip", TripSchema);

export default Trip;
