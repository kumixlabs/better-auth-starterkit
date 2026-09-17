import { Link } from "@tanstack/react-router";

import { OrganizationSwitcher } from "@kumix/better-auth-ui/organization/organization-switcher";
import { UserButton } from "@kumix/better-auth-ui/user/user-button";
import { Logo } from "./logo";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="mx-auto flex items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo />

          <h1 className="text-base">BETTER-AUTH. UI</h1>
        </Link>

        <div className="flex items-center gap-2">
          <OrganizationSwitcher align="end" />

          <UserButton size="icon" align="end" />
        </div>
      </div>
    </header>
  );
}
