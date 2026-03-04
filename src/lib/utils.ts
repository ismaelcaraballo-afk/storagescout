import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format number with commas
export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};
