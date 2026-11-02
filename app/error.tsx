"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      code="500"
      title="Plot twist: something broke"
      description="We hit an unexpected error. Try again, and if it keeps happening, come back in a bit."
      footnote={error.digest ? `ref: ${error.digest}` : undefined}
    >
      <Button onClick={reset}>Try again</Button>
      <Button variant="outline" asChild>
        <Link href="/">Back home</Link>
      </Button>
    </ErrorState>
  );
}