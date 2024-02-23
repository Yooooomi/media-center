import { Shape } from "@media-center/domain-driven";
import { localStore } from "@media-center/frontend/src/services/localStore";

export class Update extends Shape({
  updated: Boolean,
}) {
  setUpdated() {
    this.updated = true;
  }

  announcedUpdated() {
    this.updated = false;
  }
}

export const UpdateStore = {
  load: async () =>
    (await localStore.get("update", Update)) ?? new Update({ updated: false }),
  save: (update: Update) => localStore.set("update", update),
};
