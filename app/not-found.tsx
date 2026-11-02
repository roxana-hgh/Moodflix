import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";

export default function NotFound() {
  return (
    <ErrorState
      code="404"
      title="This scene got cut"
      description="The page you're looking for doesn't exist or has moved. Let's find you something to watch instead."
    >
      <Button asChild>
        <Link href="/">Back home</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/search">Search titles</Link>
      </Button>
    </ErrorState>
  );
}