export class Command<R = void> {
  private __markedAsUsed!: R;
}
export type ReturnTypeOfCommand<Q> = Q extends Command<infer R> ? R : never;
