import { Suspense } from "react";
import { EditorShell } from "@/components/editor/EditorShell";

export default function CreatePage() {
  return (
    <Suspense>
      <EditorShell />
    </Suspense>
  );
}
