import { default as Koa } from 'koa';
import { default as bodyParser } from 'koa-bodyparser';
import { default as is } from 'ramda/src/is';
import { LineWebhookValidator } from './lib/line/webhook-validator';

const isString = is(String);
const app = new Koa();
app.use(bodyParser());
let secretVariables: any = {};

const lineWebhookUrlMatcher = /^\/integrations\/line\/webhook$/;
app.use(async ({ request, throw: koaThrow }, next) => {
  console.log(request);
  const { url, method } = request;
  if (!lineWebhookUrlMatcher.test(url) || (method !== 'POST')) {
    await next();
    // console.log('middleware not run');
    return;
  }
  const {
    body: requestBody,
    rawBody,
  }: {
    body: string,
    rawBody: string,
  } = request as any;
  const { headers } = request;
  const lineSignature = headers['x-line-signature'];
  const { lineValidator }: { lineValidator: LineWebhookValidator } = secretVariables;
  if (
    (!isString(lineSignature)) ||
    (!lineValidator.validate(rawBody, lineSignature))) {
    koaThrow(400, 'Invalid Signature');
    return;
  }

  console.log(
    'middleware run',
    request.headers,
    rawBody,
    requestBody,
    lineValidator.validate(rawBody, lineSignature),
  );
});

(async () => {
  secretVariables = {
    lineValidator: new LineWebhookValidator(''),
  };
  app.listen(3000);
})();
