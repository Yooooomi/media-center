import { TooltipProps } from "./tooltip.props";
import s from "./index.module.css";

export function Tooltip({ children, tooltip }: TooltipProps) {
  if (!tooltip) {
    return children;
  }

  return (
    <>
      <div className={s.tooltip}>
        {children}
        <div className={s.tooltiptext}>{tooltip}</div>
      </div>
    </>
  );
}
