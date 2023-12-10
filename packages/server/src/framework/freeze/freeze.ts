export function Freeze() {
  return function (target: any) {
    return target;
  };
}
