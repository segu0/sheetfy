import Link from "next/link";

type LogoProps = {
  link?: string;
};

export function Logo({ link = "/" }: LogoProps) {
  return (
    <Link className="flex w-fit items-center gap-1.5 text-2xl font-bold text-zinc-900" href={link}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/logo.png" alt="Logo Sheetfy" className="max-w-30" />
    </Link>
  );
}
