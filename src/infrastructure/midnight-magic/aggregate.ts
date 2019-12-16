export interface Aggregate {
  dispatch(command: any);
  state(): any;
  pendingEvents(): any;
}
