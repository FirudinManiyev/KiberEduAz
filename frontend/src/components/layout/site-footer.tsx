import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#06080b]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <Logo />
        <p>İT və kibertəhlükəsizlik bacarıqlarını təhlükəsiz mühitdə öyrən.</p>
        <p>© 2026 KiberEduAz · MVP</p>
      </div>
    </footer>
  );
}
