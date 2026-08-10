export default function Template({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="page-transition">{children}</div>;
}
