"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Menu, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { authClient } from "@/lib/auth-client";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/shows", label: "TV Shows" },
  { href: "/genres", label: "Genres" },
];

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Header() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

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

  const handleLogout = async () => {
    await authClient.signOut();
    setIsMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={cn(
        "w-full bg-transparent fixed top-0 z-50 transition-colors h-(--header-height)",
        isScrolled && "bg-background/80 backdrop-blur border-b"
      )}
    >
      <nav className="relative h-full">
        <div className="container h-full flex items-center justify-between gap-4  py-4">
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

            {/* Desktop auth area */}
            <div className="hidden lg:block">
              {isPending ? (
                <div className="size-8.5 rounded-full bg-secondary animate-pulse" />
              ) : session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full "
                      aria-label="Open user menu"
                    >
                      <Avatar className="size-8">
                        <AvatarFallback>
                          {getInitials(session.user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{session.user.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {session.user.email}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <UserIcon />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                      <LogOut />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="outline" className="rounded-full px-5">
                  <Link href="/login">Login</Link>
                </Button>
              )}
            </div>

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

                <nav className="flex-1 px-3">
                  <ul className="list-none m-0 p-0">
                    {navLinks.map((link) => (
                      <li key={link.href} className="py-2">
                        <SheetClose asChild>
                          <Link
                            href={link.href}
                            className="block text-sm sm:text-base text-foreground/80 hover:text-primary transition-colors"
                          >
                            {link.label}
                          </Link>
                        </SheetClose>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Mobile auth area */}
                <div className="p-3 border-t">
                  {isPending ? (
                    <div className="h-10 rounded-full bg-secondary animate-pulse" />
                  ) : session?.user ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 px-1">
                        <Avatar className="size-10">
                          <AvatarFallback>
                            {getInitials(session.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">
                            {session.user.name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {session.user.email}
                          </span>
                        </div>
                      </div>

                      <SheetClose asChild>
                        <Button asChild variant="outline" size="sm" className="w-full rounded-full">
                          <Link href="/profile">
                            <UserIcon />
                            Profile
                          </Link>
                        </Button>
                      </SheetClose>

                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full rounded-full"
                        onClick={handleLogout}
                      >
                        <LogOut />
                        Log out
                      </Button>
                    </div>
                  ) : (
                    <SheetClose asChild>
                      <Button asChild size="sm" className="w-full rounded-full">
                        <Link href="/login">Login</Link>
                      </Button>
                    </SheetClose>
                  )}
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