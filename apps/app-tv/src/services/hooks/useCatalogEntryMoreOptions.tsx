import {
  MovieCatalogEntryFulfilled,
  ShowCatalogEntryFulfilled,
} from '@media-center/domains/src/catalog/applicative/catalogEntryFulfilled.front';
import {DeleteCatalogEntryCommand} from '@media-center/domains/src/commands/deleteCatalogEntry.command';
import {useCallback} from 'react';
import {Modal} from '../../components/ui/tools/modal';
import {LineButton} from '../../components/ui/input/pressable/lineButton';
import {Beta} from '../api';
import {handleBasicUserQuery} from '../../components/ui/tools/promptAlert';
import {useBooleanState} from './useBooleanState';

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
