// tslint:disable:max-classes-per-file
import { default as Joi } from '@hapi/joi';
import { Event } from '../../infrastructure/event';

export class Push {
  constructor(
    public readonly headers: { [key: string]: string },
    public readonly rawBody: string,
  ) {
  }
}

const metadataSchema = Joi.object();

const receivedDataSchema = Joi
  .object({
    headers: Joi
      .object()
      .required(),
    rawBody: Joi
      .string()
      .required(),
  });

export class Received extends Event {
  public static strict(data: any, metadata: any = {}): Received {
    Joi.assert(data, receivedDataSchema);
    Joi.assert(metadata, metadataSchema);
    return new Received(data, metadata);
  }
}
