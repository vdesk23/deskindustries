import { Link } from "@tanstack/react-router";
import { User } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="fixed bottom-4 sm:bottom-6 inset-x-0 z-50 pointer-events-none flex justify-center px-3">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/70 bg-background/60 backdrop-blur-2xl shadow-elevated pl-3 pr-2 py-2 max-w-[min(960px,100%)]">
        <div className="shrink-0 pl-1 pr-2">
          <Logo />
        </div>

        <div className="flex items-center gap-2 pl-1">
          {user ? (
            <Link to="/account">
              <Button variant="ghost" size="sm" className="rounded-full">
                <User className="size-4" /> Area clienti
              </Button>
            </Link>
          ) : (
            <Link to="/auth" search={{ redirect: "/account", mode: "login" }}>
              <Button variant="ghost" size="sm" className="rounded-full">
                Accedi
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
