/**
 * An inline script that runs while the HTML is parsed, before hydration.
 * On the client it renders as `text/plain`, which avoids React's dev warning about
 * rendering <script> tags (they never execute there anyway); `suppressHydrationWarning`
 * covers the type mismatch.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
