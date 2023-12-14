export abstract class Poll {
  constructor(protected polling: Polling) {}

  abstract poll(): () => void;
}

export abstract class Polling {
  public abstract get intervalMs(): number;
  public abstract execute(): Promise<void>;
}
