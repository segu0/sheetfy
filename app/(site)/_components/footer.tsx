import { IconBrandTiktok } from "@tabler/icons-react";
import { InstagramIcon } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t py-12 text-sm text-neutral-900">
      <div className="container mx-auto w-full space-y-12 px-4">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="flex flex-col items-center justify-center space-y-5 md:block">
            <Logo />
            <ul className="flex flex-wrap items-center gap-6 py-1.5 text-base font-medium text-zinc-900">
              <li>
                <Link className="hover:underline" href="/">
                  Home
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/planos#planos">
                  Planos
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/blog">
                  Blog
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/#faq">
                  F.A.Q
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-center justify-center space-y-6 md:block">
            <ul className="flex flex-col flex-wrap items-end gap-6 py-1.5 text-base font-medium text-zinc-900">
              <li className="mx-auto md:mx-0">
                <Link
                  target="_blank"
                  className="flex gap-2 hover:underline"
                  href="https://www.instagram.com/sheetfy.fun/"
                >
                  <InstagramIcon className="stroke-2 text-pink-500" />
                  Instagram
                </Link>
              </li>
              <li className="mx-auto md:mx-0">
                <Link
                  target="_blank"
                  className="flex gap-2 hover:underline"
                  href="https://www.instagram.com/sheetfy.fun/"
                >
                  <IconBrandTiktok className="stroke-2 text-blue-500" />
                  Tiktok
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="md:flex md:flex-row-reverse md:items-center md:justify-between">
          <ul className="flex flex-wrap items-center py-1.5 text-base text-zinc-900 sm:mt-0">
            <li className="mx-auto md:mx-0">
              <Link className="font-medium text-zinc-900 hover:underline" href="/termos">
                Termos e Política de Privacidade
              </Link>
            </li>
          </ul>
          <div className="mx-auto py-1.5 text-center text-base font-medium text-zinc-900 md:mx-0 md:text-left">
            ©{" "}
            <Link className="hover:underline" href="/">
              Sheetfy
            </Link>
            . Todos os direitos reservados.
          </div>
        </div>
      </div>

      <div className="border-t pt-12 text-neutral-900">
        <div className="container mx-auto flex w-full flex-wrap items-center justify-center gap-2 px-4">
          <a
            href="https://saaspa.ge/product/cmj3502uf003tla048m83mvyq"
            target="_blank"
            rel="nofollow"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://saaspa.ge/api/embed/product/cmj3502uf003tla048m83mvyq/badge.png?theme=green"
              alt="Featured on Saaspa.ge"
              width="200"
              height="60"
            />
          </a>

          <a target="_blank" href="https://acidtools.com">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://acidtools.com/assets/images/badge-dark.png"
              alt="Acid Tools"
              height="54"
            />
          </a>

          <a target="_blank" href="https://huntfortools.com">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://huntfortools.com/assets/images/badge.png"
              alt="Hunt for Tools"
              height="54"
            />
          </a>

          <a
            href="https://launchigniter.com/product/sheetfy?ref=badge-sheetfy"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://launchigniter.com/api/badge/sheetfy?theme=light"
              alt="Featured on LaunchIgniter"
              width="212"
              height="55"
            />
          </a>

          <a href="https://ff2050.com/products/sheetfy" target="_blank">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://ff2050.com/api/products/sheetfy/badge.svg?theme=dark&type=launch"
              alt="Launched on ff2050"
              style={{ width: "160px", height: "54px" }}
            />
          </a>

          <a href="https://startupfa.me/s/sheetfy?utm_source=sheetfy.fun" target="_blank">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://startupfa.me/badges/featured-badge.webp"
              alt="Sheetfy - Featured on Startup Fame"
              width="171"
              height="54"
            />
          </a>

          <a href="https://showmebest.ai" target="_blank">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://showmebest.ai/badge/feature-badge-white.webp"
              alt="Featured on ShowMeBestAI"
              width="220"
              height="60"
            />
          </a>

          <a href="https://fazier.com/launches/sheetfy.fun" target="_blank">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=featured&theme=light"
              width={250}
              alt="Fazier badge"
            />
          </a>

          <a href="https://twelve.tools" target="_blank">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://twelve.tools/badge0-white.svg"
              alt="Featured on Twelve Tools"
              width="200"
              height="54"
            />
          </a>

          <a href="https://turbo0.com/item/sheetfy" target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://img.turbo0.com/badge-listed-light.svg"
              alt="Listed on Turbo0"
              style={{ height: "54px", width: "auto" }}
            />
          </a>

          <a href="https://wired.business" target="_blank">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://wired.business/badge0-white.svg"
              alt="Featured on Wired Business"
              width="200"
              height="54"
            />
          </a>

          <a href="https://www.verifiedtools.info" target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.verifiedtools.info/badge.png"
              alt="Verified on Verified Tools"
              width="200"
              height="54"
            />
          </a>

          <a href="https://findly.tools/sheetfy?utm_source=sheetfy" target="_blank">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://findly.tools/badges/findly-tools-badge-light.svg"
              alt="Featured on findly.tools"
              width="150"
            />
          </a>

          <a
            href="https://www.proofstories.io/directory/products/sheetfy/"
            target="_blank"
            rel="noopener"
            style={{
              height: "60px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.proofstories.io/directory/badges/l/sheetfy.svg"
              alt="Sheetfy badge"
              style={{
                height: "60px",
              }}
            />
          </a>

          <a href="https://dofollow.tools" target="_blank">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://dofollow.tools/badge/badge_dark.svg"
              alt="Featured on Dofollow.Tools"
              width="200"
              height="54"
            />
          </a>

          <a href="https://starterbest.com" target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://starterbest.com/badages-awards.svg"
              alt="Featured on Starter Best"
              style={{
                height: "54px",
                width: "auto",
              }}
            />
          </a>

          <a
            href="https://www.saashub.com/sheetfy?utm_source=badge&utm_campaign=badge&utm_content=sheetfy&badge_variant=color&badge_kind=approved"
            target="_blank"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://cdn-b.saashub.com/img/badges/approved-color.png?v=1"
              alt="Sheetfy.fun badge"
              style={{
                maxWidth: "150px",
              }}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
