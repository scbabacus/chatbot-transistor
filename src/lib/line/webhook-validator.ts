import { createHash, createHmac, Hmac } from 'crypto';

const sha256 = (input: string): string => {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('base64');
};

export class LineWebhookValidator {
  private readonly newHash: () => Hmac;

  constructor(channelSecret: string) {
    this.newHash = () => createHmac(
      'sha256',
      channelSecret,
    );
  }

  public validate(rawBody: string, signature: string): boolean {
    const hash = this.newHash();
    hash.update(rawBody);
    const digest = hash.digest('base64');
    // secure compare
    return sha256(digest) === sha256(signature);
  }
}
