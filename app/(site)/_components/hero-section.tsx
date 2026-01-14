"use client";

import { motion, useAnimation, useReducedMotion, Variants } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";

const logos = [
  {
    alt: "Zapier",
    img: "/icons/company-1.png",
  },
  {
    alt: "n8n",
    img: "/icons/company-2.png",
  },
  {
    alt: "Make",
    img: "/icons/company-3.png",
  },
  {
    alt: "Flowise",
    img: "/icons/company-4.png",
  },
  {
    alt: "Power automate",
    img: "/icons/company-5.png",
  },
  {
    alt: "Workato",
    img: "/icons/company-6.png",
  },
  {
    alt: "Activepieces",
    img: "/icons/company-7.png",
  },
];

export function HeroSection() {
  const reduceMotion = useReducedMotion();
  const heroControls = useAnimation();
  const leftControls = useAnimation();
  const centerControls = useAnimation();
  const rightControls = useAnimation();
  const videoContainerControls = useAnimation();

  const containerVariant: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.06,
        delayChildren: 0.06,
      },
    },
  };

  const itemVariant: Variants = {
    hidden: { opacity: 0, y: 8, scale: 0.995 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 110, damping: 18 },
    },
  };

  const iconVariant: Variants = {
    hidden: { opacity: 0, scale: 0.7, rotate: -8 },
    show: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { type: "spring", stiffness: 260, damping: 22 },
    },
  };

  const videoVariant: Variants = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 80, damping: 20, delay: 0.4 },
    },
  };

  useEffect(() => {
    if (reduceMotion) {
      heroControls.set("show");
      leftControls.set("show");
      centerControls.set("show");
      rightControls.set("show");
      videoContainerControls.set("show");
      return;
    }

    const t = setTimeout(() => {
      heroControls.start("show");
      leftControls.start("show");
      centerControls.start("show");
      rightControls.start("show");
      videoContainerControls.start("show");
    }, 100);

    return () => clearTimeout(t);
  }, [
    heroControls,
    leftControls,
    centerControls,
    rightControls,
    videoContainerControls,
    reduceMotion,
  ]);

  return (
    <motion.header
      className="container mx-auto px-4 pt-24"
      variants={containerVariant}
      initial="hidden"
      animate={heroControls}
    >
      <motion.h1
        className="mx-auto max-w-6xl text-center text-4xl leading-10 font-semibold tracking-tight text-zinc-800 sm:text-6xl sm:leading-26 lg:text-8xl"
        variants={itemVariant}
      >
        Transforme suas planilhas{" "}
        <span className="inline-flex items-center gap-5 align-bottom">
          <motion.span
            className="flex size-14 items-center justify-center rounded-2xl bg-green-100 p-2 sm:size-20"
            style={{ boxShadow: "2px 5px 6px -1px rgba(0, 0, 0, 0.28)" }}
            variants={iconVariant}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/sheet.png" alt="Excel" className="h-full w-full object-contain" />
          </motion.span>

          <motion.span style={{ display: "inline-block" }} variants={itemVariant}>
            <span>em API&apos;s</span>
          </motion.span>
        </span>
      </motion.h1>

      <motion.p variants={itemVariant} className="mx-auto mt-5 max-w-150 text-center text-lg">
        Sem código, sem servidores, sem complicação. Faça upload e tenha sua API REST em segundos.
      </motion.p>

      <motion.div
        className="absolute -right-95 left-0 mx-auto w-20 rotate-90"
        variants={itemVariant}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/arrow.png" alt="" />
      </motion.div>

      <motion.div
        className="relative z-10 mx-auto mt-10 flex justify-center"
        variants={itemVariant}
      >
        <Link href="/login" className="w-fit">
          <Button className="mx-auto flex cursor-pointer rounded-full border-black px-5 py-10 text-base font-medium sm:px-10 sm:py-10 sm:text-xl">
            Criar Minha Primeira API
          </Button>
        </Link>
      </motion.div>

      <motion.div variants={videoVariant} initial="hidden" animate={videoContainerControls}>
        <div className="max-w-container relative mx-auto mt-10 w-full rounded-2xl border border-neutral-200 bg-neutral-100 p-1 md:mt-20 md:rounded-4xl md:p-4">
          {/* <div className="aspect-video w-full overflow-hidden rounded-[14px] border border-neutral-200 bg-white md:rounded-3xl">
            <video controls autoPlay>
              <source src="/videos/demo_v2.mp4" type="video/mp4" />
            </video>
          </div> */}
          <div className="aspect-video w-full overflow-hidden rounded-[14px] border border-neutral-200 bg-white md:rounded-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={"/images/hero.png"}
              width={0}
              height={0}
              alt="Imagem do hero"
              className="h-full w-full"
            />
          </div>
        </div>

        <div className="relative">
          <Marquee pauseOnHover className="relative mt-10 gap-10 [--duration:20s] [&_div]:gap-12">
            {logos.map((item) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.img}
                alt={item.alt}
                className="bg-cli max-w-30 object-contain"
                key={item.alt}
              />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-white"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l from-white"></div>
        </div>
      </motion.div>
    </motion.header>
  );
}
