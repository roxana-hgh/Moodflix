import { cacheLife } from "next/cache";

async function Footer() {
  "use cache";
  cacheLife("days"); // the year is the only thing here that changes

  return (
    <footer className="py-3 border-t">
      <div className="container mx-auto flex justify-center gap-2">
        <span className="text-[10px] text-muted-foreground">
          &copy; {new Date().getFullYear()} MoodFlix. All rights reserved.
        </span>
        <span className="text-[10px] text-muted-foreground">This application uses the TMDB API</span>
      </div>
    </footer>
  );
}

export default Footer;
