import { Navigation } from "@media-center/frontend/src/screens";
import {
  NavigationContext,
  useNavigate,
} from "@media-center/frontend/src/screens/params";
import { InjectUnderContext } from "@media-center/frontend/src/services/contexts/injectableContext";
import { useBack } from "@media-center/frontend/src/services/hooks/useBack";
import { useCallback } from "react";

InjectUnderContext(NavigationContext.Provider, () => {
  const { goBack } = useNavigate();

  useBack(
    useCallback(() => {
      goBack();
      return true;
    }, [goBack]),
  );

  return null;
});

export function App() {
  return <Navigation />;
}
