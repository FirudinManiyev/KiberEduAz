"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getRevealChildDelay, getRevealMotionProfile } from "@/lib/motion/reveal";

const REVEAL_SELECTOR = 'main section:not([data-reveal="none"]), main [data-reveal="section"]';

export function ScrollRevealController() {
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const registered = new WeakSet<Element>();
    const registeredChildren = new WeakSet<Element>();
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

    function isAmbientLayer(element: HTMLElement): boolean {
      return (
        element.classList.contains("absolute") ||
        element.classList.contains("hero-scan") ||
        element.classList.contains("cyber-grid")
      );
    }

    function registerChildren(section: HTMLElement) {
      let contentIndex = 0;
      let ambientIndex = 0;

      for (const child of Array.from(section.children)) {
        if (!(child instanceof HTMLElement)) continue;

        const ambient = isAmbientLayer(child);
        const layerIndex = ambient ? ambientIndex++ : contentIndex++;

        if (registeredChildren.has(child)) continue;

        registeredChildren.add(child);
        child.dataset.revealLayer = ambient ? "ambient" : "content";
        child.style.setProperty(
          "--reveal-delay",
          `${ambient ? Math.min(layerIndex * 70, 140) : getRevealChildDelay(layerIndex)}ms`,
        );
      }
    }

    function registerSections() {
      const sections = document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);

      sections.forEach((section, index) => {
        registerChildren(section);

        if (registered.has(section)) return;

        registered.add(section);
        const profile = getRevealMotionProfile(index);

        section.classList.add("scroll-reveal");
        section.dataset.revealVariant = profile.variant;
        section.dataset.revealAccent = profile.accent;

        if (intersectionObserver) {
          intersectionObserver.observe(section);
        } else {
          section.classList.add("is-revealed");
        }
      });
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
