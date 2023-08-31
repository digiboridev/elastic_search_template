import { GeoLocation } from "./location";

export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  interests: string[];
  age: number;
  job: string;
  location: GeoLocation;
};
