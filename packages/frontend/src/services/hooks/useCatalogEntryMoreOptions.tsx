import {
  MovieCatalogEntryFulfilled,
  ShowCatalogEntryFulfilled,
} from "@media-center/domains/src/catalog/applicative/catalogEntryFulfilled.front";
import { DeleteCatalogEntryCommand } from "@media-center/domains/src/commands/deleteCatalogEntry.command";
import { ScanSubtitlesCommand } from "@media-center/domains/src/hierarchyEntryInformation/applicative/scanSubtitles.command";
import { useCallback } from "react";
import { PromiseAllByChunk } from "@media-center/algorithm";
import { LineButton } from "../../components/ui/input/pressable/lineButton";
import { handleBasicUserQuery } from "../../components/ui/tools/promptAlert";
import { Modal } from "../../components/ui/tools/modal";
import { Beta } from "../api/api";
import { useBooleanState } from "./useBooleanState";

interface CatalogEntryMoreOptionsProps {
  catalogEntry:
    | MovieCatalogEntryFulfilled
    | ShowCatalogEntryFulfilled
    | undefined;
  reload: () => void;
  close: () => void;
  scanSubtitles: () => void;
}

function CatalogEntryMoreOptions({
  catalogEntry,
  reload,
  close,
  scanSubtitles,
}: CatalogEntryMoreOptionsProps) {
  const handleDelete = useCallback(async () => {
    if (!catalogEntry?.id) {
      return;
    }
    handleBasicUserQuery(
      Beta.command(new DeleteCatalogEntryCommand(catalogEntry.id)),
    );
    close();
  }, [catalogEntry?.id, close]);

  return (
    <>
      <LineButton text="Recharger" onPress={reload} focusOnMount />
      <LineButton
        variant="delete"
        text="Recharger les sous-titres"
        onPress={scanSubtitles}
      />
      <LineButton variant="delete" text="Supprimer" onPress={handleDelete} />
    </>
  );
}

interface UseCatalogEntryMoreOptionsProps {
  catalogEntry:
    | MovieCatalogEntryFulfilled
    | ShowCatalogEntryFulfilled
    | undefined;
  reload: () => void;
}

export function useCatalogEntryMoreOptions({
  catalogEntry,
  reload,
}: UseCatalogEntryMoreOptionsProps) {
  const [isOpen, open, close] = useBooleanState();

  const handleReload = useCallback(() => {
    reload();
    close();
  }, [close, reload]);

  const handleScanSubtitles = useCallback(async () => {
    close();
    if (!catalogEntry) {
      return;
    }
    try {
      if (catalogEntry instanceof MovieCatalogEntryFulfilled) {
        await Promise.all(
          catalogEntry.dataset.hierarchyItems.map((hierarchyItem) =>
            Beta.command(new ScanSubtitlesCommand(hierarchyItem.id)),
          ),
        );
      }
      if (catalogEntry instanceof ShowCatalogEntryFulfilled) {
        console.log(catalogEntry.dataset);
        await PromiseAllByChunk(
          catalogEntry.dataset,
          (data) =>
            Promise.all(
              data.hierarchyItems.map((hierarchyItem) =>
                Beta.command(new ScanSubtitlesCommand(hierarchyItem.id)),
              ),
            ),
          1,
        );
      }
    } catch (e) {}
  }, [catalogEntry, close]);

  return {
    open,
    element: (
      <Modal title="Plus d'options" open={isOpen} onClose={close}>
        <CatalogEntryMoreOptions
          catalogEntry={catalogEntry}
          reload={handleReload}
          close={close}
          scanSubtitles={handleScanSubtitles}
        />
      </Modal>
    ),
  };
}
