// tslint:disable-next-line: ban-types
type MappingEntry = Function[];

export class AggregateRoot {
  public state: any;
  public pendingEvents: any[];

  constructor(
    private readonly handlerMap: MappingEntry[],
    state: any) {
    this.state = state;
    this.pendingEvents = [];
  }

  public apply(...events: any[]): void {
    let { state } = this;
    for (const event of events) {
      for (const mappingEntry of this.handlerMap) {
        const [eventClass, stateReducer] = mappingEntry;
        if (event instanceof eventClass) {
          state = stateReducer(state, event);
          break;
        }
      }
    }
    this.state = state;
    const { pendingEvents } = this;
    this.pendingEvents = [...pendingEvents, ...events];
  }
}
