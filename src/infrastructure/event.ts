export class Event {
  constructor(
    public readonly data: { [key: string]: any },
    public readonly metadata: { [key: string]: any },
  ) {
  }
}
