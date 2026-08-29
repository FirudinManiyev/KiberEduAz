"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const REVEAL_SELECTOR = 'main section:not([data-reveal="none"]), main [data-reveal="section"]';

export function ScrollRevealController() {
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const registered = new WeakSet<Element>();
    let animationFrame = 0;

    const intersectionObserver =
      !reducedMotion && "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries, observer) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) continue;

                entry.target.classList.add("is-revealed");
                observer.unobserve(entry.target);
              }
            },
            { threshold: 0.01, rootMargin: "0px 0px -8% 0px" },
          )
        : null;

    function registerSections() {
      const sections = document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);

      for (const section of sections) {
        if (registered.has(section)) continue;

        registered.add(section);
        section.classList.add("scroll-reveal");

        if (intersectionObserver) {
          intersectionObserver.observe(section);
        } else {
          section.classList.add("is-revealed");
        }
      }
    }

    function scheduleRegistration() {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(registerSections);
    }

    scheduleRegistration();

    const mutationObserver = new MutationObserver(scheduleRegistration);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      mutationObserver.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [pathname]);

  return null;
}
