import "react";
import type { LucideIcon as ActualLucideIcon } from "lucide-react";

declare module "react" {
  export type LucideIcon = ActualLucideIcon;
}
