import { model, Schema } from "mongoose";

interface IFlight {
  company: "IndiGo" | "Air Asia" | "Air India" | "Spice Jet" | string;
  time: Date;
  duration: Date;
  price: string;
  trips?: Schema.Types.ObjectId;
}

const FlightSchema = new Schema<IFlight>(
  {
    company: String,
    time: Date,
    duration: Date,
    price: Number,
    trips: [{ type: Schema.Types.ObjectId, ref: "Trips" }],
  },
  { timestamps: false, toJSON: { virtuals: true, getters: true } }
);

// if it returns true then okay but if false then it will stop execution and throw the given 'errorMsg' here
FlightSchema.path("company").validate(function (value: IFlight["company"]) {
  return /IndiGo|Air Asia|Air India|Spice Jet/i.test(value);
}, "company `{VALUE}` is invalid");

const Flight = model<IFlight>("Flight", FlightSchema);

export default Flight;
