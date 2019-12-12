import { readFile as callbackedReadFile } from 'fs';
import { default as Koa } from 'koa';
import { default as bodyParser } from 'koa-bodyparser';
import { default as is } from 'ramda/src/is';
import { promisify } from 'util';
import { LineWebhookValidator } from './lib/line/webhook-validator';

const isString = is(String);
const app = new Koa();
app.use(bodyParser());
let mutableSecrets: any = {};

const lineWebhookUrlMatcher = /^\/integrations\/line\/webhook$/;
app.use(async ({ request, throw: koaThrow }, next) => {
  console.log(request);
  const { url, method } = request;
  if (!lineWebhookUrlMatcher.test(url)) {
    await next();
    // console.log('middleware not run');
    return;
  }
  if (method !== 'POST') {
    koaThrow(405);
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
  const { lineValidator }: {
    lineValidator: LineWebhookValidator,
  } = mutableSecrets;
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

const readFile = promisify(callbackedReadFile);
(async () => {
  const rawSecrets = await readFile('configs/secrets.json');
  const secrets = JSON.parse(rawSecrets.toString());
  const { lineChannelSecret } = secrets;
  const expansion = {
    lineValidator: new LineWebhookValidator(lineChannelSecret),
  };
  mutableSecrets = {
    ...secrets,
    ...expansion,
  };
  app.listen(3000);
})();
