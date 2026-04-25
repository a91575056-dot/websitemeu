"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

type NavItem = {
  label: string;
  href: string;
};

type SiteHeaderProps = {
  navItems: NavItem[];
  whatsappHref: string;
  siteName: string;
};

export function SiteHeader({
  navItems,
  whatsappHref,
  siteName,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    let lastY = window.scrollY;

    function onScroll() {
      const currentY = window.scrollY;
      const delta = currentY - lastY;
      const nearTop = currentY < 24;

      if (nearTop || menuOpen) {
        setIsHeaderVisible(true);
      } else if (delta > 4) {
        setIsHeaderVisible(false);
      } else if (delta < -4) {
        setIsHeaderVisible(true);
      }

      lastY = currentY;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  function handleBrandClick(event: React.MouseEvent<HTMLAnchorElement>) {
    setMenuOpen(false);

    if (pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleSectionNavClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    setMenuOpen(false);

    if (!href.startsWith("/#") || pathname !== "/") {
      return;
    }

    event.preventDefault();

    const sectionId = href.replace("/#", "");
    const target = document.getElementById(sectionId);

    if (!target) {
      return;
    }

    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b border-white/60 bg-[rgba(248,244,237,0.78)] backdrop-blur-xl transition-transform duration-300 ease-out lg:translate-y-0 ${
        isHeaderVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[104rem] items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        <Link
          href="/"
          onClick={handleBrandClick}
          className="inline-flex items-center gap-3"
        >
          <span className="flex items-center justify-center">
            <Image
              src="/logo-trim.png"
              alt="Dionis Web logo"
              width={337}
              height={311}
              className="h-7 w-auto object-contain sm:h-10"
              priority
            />
          </span>
          <span className="block">
            <span className="block font-display text-base font-semibold text-slate-950 sm:text-lg">
              {siteName}
            </span>
            <span className="text-[0.65rem] tracking-[0.22em] text-slate-400 uppercase sm:text-xs">
              Web Designer
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === pathname ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                onClick={(event) => handleSectionNavClick(event, item.href)}
                className={`text-sm font-medium transition-colors hover:text-slate-950 ${
                  isActive ? "text-slate-950" : "text-slate-600"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="button-primary">
            <MessageCircle className="size-4" />
            Chat on WhatsApp
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex size-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm lg:hidden"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-white/70 bg-[rgba(248,244,237,0.96)] px-4 py-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.55)] lg:hidden"
          >
            <nav className="mx-auto flex w-full max-w-[104rem] flex-col gap-3">
              {navItems.map((item) => {
                const isActive =
                  item.href === pathname ||
                  (item.href !== "/" && pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={`${item.label}-${item.href}-mobile`}
                    href={item.href}
                    onClick={(event) => handleSectionNavClick(event, item.href)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-sm font-semibold ${
                      isActive
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-white/80 bg-white/80 text-slate-900"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                    <ArrowRight className="size-4" />
                  </Link>
                );
              })}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuOpen(false)}
                className="button-primary mt-2 justify-center"
              >
                <MessageCircle className="size-4" />
                Chat on WhatsApp
              </a>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

