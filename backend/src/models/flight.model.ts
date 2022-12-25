import { model, Schema, SchemaTypes } from 'mongoose';

export interface IFlight {
  company: "IndiGo" | "Air Asia" | "Air India" | "Spice Jet" | string;
  from: string;
  to: string;
  arrivalTime: Date;

  departureTime: Date;
  duration: Date;
  price: string;
}


SchemaTypes.String.set('trim', true);
SchemaTypes.String.set("lowercase", true);

const FlightSchema = new Schema<IFlight>(
  {
    company: String,
    from: String,
    to: String,
    arrivalTime: Date,
    departureTime: Date,
    duration: Date,
    price: Number,
  },
  { timestamps: true, toJSON: { virtuals: true, getters: true } }
);

// FlightSchema.path("company").isRequired; // this is how validator could be set if needed

// if it returns true then okay but if false then it will stop execution and throw the given 'errorMsg' here
FlightSchema.path("company").validate(function (value: IFlight["company"]) {
  return /IndiGo|Air Asia|Air India|Spice Jet/i.test(value);
}, "company `{VALUE}` is invalid");

// https://mongoosejs.com/docs/api/schematype.html#schematype_SchemaType-validate

const Flight = model<IFlight>("Flight", FlightSchema);

export default Flight;
