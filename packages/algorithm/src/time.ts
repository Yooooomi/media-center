export class TimeMeasurer {
  constructor(private readonly from: number) {}

  static fromNow() {
    return new TimeMeasurer(Date.now());
  }

  calc() {
    return Date.now() - this.from;
  }
}
