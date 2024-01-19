import {
  MovieCatalogEntryFulfilled,
  ShowCatalogEntryFulfilled,
} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import {DeleteCatalogEntryCommand} from '@media-center/server/src/domains/commands/deleteCatalogEntry.command';
import {Modal} from '../components/modal';
import {useBooleanState} from './useBooleanState';
import {useCallback} from 'react';
import {LineButton} from '../components/ui/pressable/lineButton';
import {Beta} from './api';
import {handleBasicUserQuery} from '../components/ui/promptAlert';

interface CatalogEntryMoreOptionsProps {
  catalogEntry:
    | MovieCatalogEntryFulfilled
    | ShowCatalogEntryFulfilled
    | undefined;
  reload: () => void;
  close: () => void;
}

function CatalogEntryMoreOptions({
  catalogEntry,
  reload,
  close,
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

  return {
    open,
    element: (
      <Modal title="Plus d'options" open={isOpen} onClose={close}>
        <CatalogEntryMoreOptions
          catalogEntry={catalogEntry}
          reload={handleReload}
          close={close}
        />
      </Modal>
    ),
  };
}
