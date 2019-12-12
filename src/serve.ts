import { readFile as callbackedReadFile } from 'fs';
import { default as Koa } from 'koa';
import { default as bodyParser } from 'koa-bodyparser';
import { promisify } from 'util';
import { LineWebhookController } from './controllers/line-webhook';
import { LineWebhookValidator } from './lib/line/webhook-validator';

const app = new Koa();
app.use(bodyParser());
let mutableSecrets: any = {};

const lineWebhookUrlMatcher = /^\/integrations\/line\/webhook$/;
app.use(async (context, next) => {
  const { request, throw: koaThrow } = context;
  console.log(request);
  const { url, method } = request;
  if (!lineWebhookUrlMatcher.test(url)) {
    await next();
    return;
  }
  if (method !== 'POST') {
    koaThrow(405);
    return;
  }
  const { lineValidator }: {
    lineValidator: LineWebhookValidator,
  } = mutableSecrets;
  const controller = new LineWebhookController(lineValidator);
  await controller.handle(context, next);
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
