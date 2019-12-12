// tslint:disable:max-classes-per-file

import { Event } from '../../infrastructure/event';

export class Push {
  constructor(
    public readonly headers: { [key: string]: string },
    public readonly rawBody: string,
  ) {
  }
}

export class Received extends Event {
}
