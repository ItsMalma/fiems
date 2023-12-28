import React from "react";
import { useDeepCompareEffect } from "use-deep-compare";

export function useAction<Result>(
  action: (...args: any[]) => Promise<Result>,
  ...args: any[]
): [Result | undefined, () => void] {
  const [isRefresh, setIsRefresh] = React.useState(false);
  const refresh = React.useCallback(() => setIsRefresh(true), []);

  const [result, setResult] = React.useState<Result | undefined>(undefined);

  useDeepCompareEffect(() => {
    if (args.every((arg) => arg !== undefined && arg !== null)) {
      action(...args).then(setResult);
    }
    setIsRefresh(false);
  }, [action, args, isRefresh, result]);

  return [result, refresh];
}
