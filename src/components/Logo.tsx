import { Link } from "@tanstack/react-router";
import logo from "@/assets/desk-logo.png";

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <img
        src={logo}
        alt="Desk Industries"
        width={size}
        height={size}
        className="rounded-md transition-transform duration-300 group-hover:scale-105"
        style={{ width: size, height: size }}
      />
      <span className="font-display font-semibold tracking-tight text-foreground hidden sm:inline">
        Desk Industries
      </span>
    </Link>
  );
}
