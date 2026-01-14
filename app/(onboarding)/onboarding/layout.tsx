export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen max-h-screen w-full overflow-hidden">
      <main className="flex h-full w-full items-center justify-center p-4">{children}</main>
    </div>
  );
}
