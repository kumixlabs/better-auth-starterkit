import { createFileRoute } from "@tanstack/react-router";

import { UserButton } from "@kumix/better-auth-ui/user/user-button";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="flex grow flex-col items-center justify-center gap-4">
      <UserButton />
    </div>
  );
}
