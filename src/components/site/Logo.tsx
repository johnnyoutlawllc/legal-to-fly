import Link from "next/link";
import { Mark } from "@/components/Mark";

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Legal to Fly home">
      <Mark className={size === "sm" ? "h-7 w-7" : "h-9 w-9"} />
      <span className={`${size === "sm" ? "text-base" : "text-lg"} font-semibold tracking-tight`}>
        Legal<span className="text-[var(--accent)]">to</span>Fly
      </span>
    </Link>
  );
}
