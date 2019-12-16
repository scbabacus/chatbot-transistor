import { Aggregate } from '../../infrastructure/midnight-magic/aggregate';
import { AggregateRoot } from '../../infrastructure/midnight-magic/aggregate-root';
import { Push, Received } from './entities';

export class UseCase implements Aggregate {
  private readonly root: AggregateRoot;

  constructor() {
    this.root = new AggregateRoot();
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

  public pendingEvents(): any {
    return this.root.pendingEvents;
  }

  public state(): any {
    return this.root.state;
  }

  private push(data) {
    this.root.apply(Received.strict(data));
  }
}
