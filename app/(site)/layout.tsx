import ReactLenis from "lenis/react";

import { Footer } from "./_components/footer";
import { Navigation } from "./_components/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactLenis className="w-full" root>
      <Navigation />
      {children}
      <Footer />
    </ReactLenis>
  );
}
