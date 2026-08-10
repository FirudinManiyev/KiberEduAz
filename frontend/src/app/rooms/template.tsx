export default function RoomsTemplate({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="page-transition page-transition--nested">{children}</div>;
}
