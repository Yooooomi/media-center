import { CommandBus, Polling } from "@media-center/domain-driven";
import { PopulateNewestCalendarCommand } from "./populateNewestCalendar.command";

export class PopulateNewestCalendarPoll extends Polling {
  intervalMs = 1000 * 60 * 60 * 24;

  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  public async execute() {
    await this.commandBus.execute(new PopulateNewestCalendarCommand());
  }
}
