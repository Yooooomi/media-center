import { useCallback } from "react";
import { HierarchyItemId } from "@media-center/domains/src/fileWatcher/domain/hierarchyItemId";
import { useNavigate } from "../../screens/navigation.dependency";

export function usePlayCatalogEntry(
  hierarchyItemId: HierarchyItemId | undefined,
) {
  const { navigate } = useNavigate();

  const play = useCallback(() => {
    if (!hierarchyItemId) {
      return;
    }

    return navigate("Watch", {
      hierarchyItemId: hierarchyItemId.toString(),
    });
  }, [hierarchyItemId, navigate]);

  return { play };
}
