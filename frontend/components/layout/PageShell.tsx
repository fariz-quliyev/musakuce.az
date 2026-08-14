import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/home/Footer";

/** Shared Navbar + Footer wrapper for every non-homepage route page. */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
