"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

import { SearchResultsDropdown } from "@/features/search/components/search-results-dropdown";
import { useSearchMedia } from "@/features/search/hook";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/tv-shows", label: "TV Shows" },
  { href: "/about", label: "About" },
];

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedQuery = useDebounce(searchQuery, 350);
  const {
    data: results,
    isLoading,
    isFetching,
  } = useSearchMedia(debouncedQuery);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) closeSearch();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearchOpen]);



  const toggleSearch = () => {
    setIsMenuOpen(false);
    if (isSearchOpen) {
      closeSearch();
    } else {
      setIsSearchOpen(true);
    }
  };

  return (
    <header
      className={cn(
        "w-full bg-transparent top-0 z-50 absolute transition-colors",
        isScrolled && "bg-background/80 backdrop-blur sticky border-b"
      )}
    >
      <nav className="relative">
        <div className="container flex items-center justify-between gap-4 px-4 lg:px-8 py-4">
          <div className="flex gap-6">
            <Link href="/" className="text-primary font-bold text-lg shrink-0">
              MOODFLIX
            </Link>

            <div className="hidden lg:flex flex-1 justify-center">
              <ul className="flex gap-6 list-none m-0 p-0">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/80 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop search — inline expand */}
            <div className="hidden lg:flex relative items-center">
              <div
                className={cn(
                  "flex items-center overflow-hidden rounded-full transition-all duration-200",
                  isSearchOpen ? "w-72 bg-secondary border px-3" : "w-9"
                )}
              >
                {isSearchOpen && <Search className="size-4 text-primary shrink-0" />}
                {isSearchOpen && (
                  <Input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="border-0 shadow-none bg-transparent! focus-visible:ring-0 h-9 px-2"
                  />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-full"
                  onClick={toggleSearch}
                  aria-label={isSearchOpen ? "Close search" : "Open search"}
                >
                  {isSearchOpen ? <X className="size-4" /> : <Search className="size-4" />}
                </Button>
              </div>

              {isSearchOpen && searchQuery.trim().length >= 2 && (
                <div className="absolute top-full mt-2 w-full">
                  <SearchResultsDropdown
                    query={searchQuery}
                    results={results}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    onSelect={closeSearch}
                  />
                </div>
              )}
            </div>

            {/* Mobile search trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={toggleSearch}
              aria-label={isSearchOpen ? "Close search" : "Open search"}
            >
              {isSearchOpen ? <X className="size-5" /> : <Search className="size-5" />}
            </Button>

            <Button asChild variant="outline" className="hidden lg:inline-flex rounded-full px-5">
              <Link href="/login">Login</Link>
            </Button>

            <Sheet
              open={isMenuOpen}
              onOpenChange={(open) => {
                setIsMenuOpen(open);
                if (open) closeSearch();
              }}
            >
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col">
                <SheetHeader>
                  <SheetTitle className="text-center">
                    <span className="text-primary font-bold">MOODFLIX</span>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex-1 px-2">
                  <ul className="list-none m-0 p-0">
                    {navLinks.map((link) => (
                      <li key={link.href} className="py-2">
                        <SheetClose asChild>
                          <Link
                            href={link.href}
                            className="block text-base text-foreground/80 hover:text-primary transition-colors"
                          >
                            {link.label}
                          </Link>
                        </SheetClose>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="p-3 border-t">
                  <Button asChild className="w-full rounded-full">
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile search — full-width dropdown bar */}
        {isSearchOpen && (
          <div className="lg:hidden border-t bg-background/50 backdrop-blur px-4 py-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 rounded-full border px-3">
              <Search className="size-4 text-primary shrink-0" />
              <Input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="border-0 shadow-none bg-transparent! focus-visible:ring-0 h-10 px-2"
              />
            </div>

            {searchQuery.trim().length >= 2 && (
              <div className="mt-2">
                <SearchResultsDropdown
                  query={searchQuery}
                  results={results}
                  isLoading={isLoading}
                  isFetching={isFetching}
                  onSelect={closeSearch}
                />
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;