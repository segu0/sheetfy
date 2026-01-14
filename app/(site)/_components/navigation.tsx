"use client";

import { motion, useAnimation, useReducedMotion, Variants } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const reduceMotion = useReducedMotion();
  const controls = useAnimation();

  const navVariant: Variants = {
    hidden: { opacity: 0, y: -14 },
    show: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    if (reduceMotion) {
      controls.set({ opacity: 1, y: 0 });
      return;
    }

    const t = setTimeout(() => {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { type: "spring" as const, stiffness: 140, damping: 24 },
      });
    }, 80);

    return () => clearTimeout(t);
  }, [controls, reduceMotion]);

  const navClasses = `right-0 left-0 z-50 mx-auto`;

  return (
    <motion.nav className={navClasses} variants={navVariant} initial="hidden" animate={controls}>
      <div className="container mx-auto flex w-full items-center justify-between px-4 py-4 transition-colors duration-300">
        <Logo />
        <ul className="hidden h-fit gap-11 font-medium md:flex">
          <li>
            <Link className={`transition-colors hover:text-zinc-700/80`} href={"/"}>
              Home
            </Link>
          </li>
          <li>
            <Link className={`transition-colors hover:text-zinc-700/80`} href={"/planos#planos"}>
              Planos
            </Link>
          </li>
          <li>
            <Link className={`transition-colors hover:text-zinc-700/80`} href={"/blog"}>
              Blog
            </Link>
          </li>
          <li>
            <Link className={`transition-colors hover:text-zinc-700/80`} href={"/#faq"}>
              F.A.Q
            </Link>
          </li>
        </ul>
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link href="/login">
              <Button className="cursor-pointer rounded-full" variant={"default"} size={"lg"}>
                Login
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}
