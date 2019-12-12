import { ParameterizedContext } from 'koa';
import { default as is } from 'ramda/src/is';
import { default as pick } from 'ramda/src/pick';
import { Push } from '../business-logic/line-webhook/entities';
import { UseCase } from '../business-logic/line-webhook/use-case';
import { LineWebhookValidator } from '../lib/line/webhook-validator';

const isString = is(String);
const pickHeaders = pick([
  'x-line-signature',
  'content-type',
  'user-agent',
]);

export class LineWebhookController {
  constructor(private readonly lineValidator: LineWebhookValidator) {
  }

  public async handle(context: ParameterizedContext, ..._) {
    const shouldContinue = this.checkSignature(context);
    if (!shouldContinue) {
      return;
    }
    const { request } = context;
    const { body: requestBody, rawBody }: {
      body: string,
      rawBody: string,
    } = request as any;
    const aggregate = this.buildAggregate();
    const { headers } = request;
    await aggregate.dispatch(new Push(
      pickHeaders(headers),
      rawBody,
    ));
    const { pendingEvents } = aggregate;
    console.log(
      'middleware run',
      // request.headers,
      // requestBody,
      JSON.stringify(pendingEvents, null, 5),
      // pendingEvents,
    );
  }

  private checkSignature(context: ParameterizedContext) {
    const { request, throw: koaThrow } = context;
    const { rawBody }: {
      rawBody: string,
    } = request as any;
    const { headers } = request;
    const lineSignature = headers['x-line-signature'];
    if (
      (!isString(lineSignature)) ||
      (!this.lineValidator.validate(rawBody, lineSignature))) {
      koaThrow(400, 'Invalid Signature');
      return false;
    }
    return true;
  }

  private buildAggregate(): UseCase {
    return new UseCase();
  }
}
