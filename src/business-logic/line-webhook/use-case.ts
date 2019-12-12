import { Push, Received } from './entities';

export class UseCase {
  public readonly pendingEvents: any[];

  constructor() {
    this.pendingEvents = [];
  }

  public async dispatch(command: any) {
    if (command instanceof Push) {
      this.push({
        headers: command.headers,
        rawBody: command.rawBody,
      });
      return;
    }
    throw new TypeError('Unknown command');
  }

  private push({ headers, rawBody }) {
    this.pendingEvents.push(new Received(
      {
        rawBody,
        headers,
      },
      {},
    ));
  }
}
