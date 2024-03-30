import { Calendar } from "../domain/calendar";

export abstract class CalendarAPI {
  abstract get(): Promise<Calendar>;
}
