import Link from "next/link";

export function Header() {
  return (
    <h2 className="mb-20 flex items-center text-2xl leading-tight font-bold tracking-tight text-zinc-900 md:text-4xl md:tracking-tighter">
      <Link href="/" className="hover:underline">
        Blog
      </Link>
      .
    </h2>
  );
}
