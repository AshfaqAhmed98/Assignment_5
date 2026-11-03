import { ViewTransition, type ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit">
      {children}
    </ViewTransition>
  );
}
