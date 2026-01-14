"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sparkles, Star, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HandwrittenHero() {
  return (
    <div className="min-h-screen">
      <header className="container mx-auto flex h-20 items-center justify-between px-4">
        <a href="#" className="font-mono text-xl font-bold tracking-tighter">
          LOGO
        </a>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 transform space-x-12 md:flex">
          <a href="#" className="text-[15px] font-medium">
            Products
          </a>
          <a href="#" className="text-[15px] font-medium">
            Testimonial
          </a>
          <a href="#" className="text-[15px] font-medium">
            About Us
          </a>
          <a href="#" className="text-[15px] font-medium">
            Resources
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden rounded-full font-medium md:inline-flex">
            Download Now
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <nav className="mt-6 flex flex-col space-y-4">
                <a href="#" className="text-[15px] font-medium">
                  Products
                </a>
                <a href="#" className="text-[15px] font-medium">
                  Testimonial
                </a>
                <a href="#" className="text-[15px] font-medium">
                  About Us
                </a>
                <a href="#" className="text-[15px] font-medium">
                  Resources
                </a>
                <Button variant="outline" className="w-full rounded-full font-medium">
                  Download Now
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main>
        <section className="container px-4 py-12 text-center md:py-24">
          <motion.h1
            className="relative mx-auto max-w-3xl font-mono text-xl font-medium tracking-tight sm:text-4xl md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Digitalize{" "}
            <motion.span
              className="relative inline-block bg-blue-500/20"
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              handwritten
              <motion.div
                className="absolute -top-2 -left-2 h-3 w-3 rounded-full bg-blue-500"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              />
              <motion.div
                className="absolute -right-2 -bottom-2 h-3 w-3 rounded-full bg-blue-500"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, duration: 0.3 }}
              />
              <motion.div
                className="absolute top-0 bottom-0 -left-1 w-1 bg-blue-500"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.9, duration: 0.3 }}
              />
              <motion.div
                className="absolute top-0 -right-1 bottom-0 w-1 bg-blue-500"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.9, duration: 0.3 }}
              />
            </motion.span>{" "}
            notes in seconds.
          </motion.h1>

          <motion.div
            className="bg-muted mx-auto mt-8 flex max-w-2xl flex-col items-center justify-center gap-4 rounded-xl p-2 sm:flex-row md:mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Button size="sm" variant="ghost" className="w-full gap-2 sm:w-auto">
              <Star className="h-4 w-4" />
              Connect Notion
            </Button>
            <div className="bg-foreground hidden h-6 w-px sm:block" />
            <Button size="sm" variant="ghost" className="w-full gap-2 sm:w-auto">
              <Upload className="h-4 w-4" />
              Upload Notes
            </Button>
            <div className="bg-foreground hidden h-6 w-px sm:block" />
            <Button size="sm" variant="ghost" className="w-full gap-2 sm:w-auto">
              <Sparkles className="h-4 w-4" />
              Transcribe and Save
            </Button>
            <Button size="sm" className="w-full rounded-lg sm:w-auto">
              Get Started
            </Button>
          </motion.div>
        </section>

        <motion.section
          className="relative container px-4 pb-12 md:pb-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="relative mx-auto max-w-5xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-center md:gap-0">
              <motion.div
                className="bg-background w-full rounded-[32px] border-2 text-center md:absolute md:top-12 md:left-0 md:w-[35%]"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1, rotate: [0, 0, -6] }}
                transition={{ duration: 0.6 }}
              >
                <div className="rounded-[32px] p-8 shadow-[0_8px_0px_0px_rgba(0,0,0,1)] transition-transform">
                  <div className="text-xs font-medium text-amber-600">YOU ONLY NEED ONE APP</div>
                  <h3 className="mt-2 px-6 text-[28px] leading-tight font-semibold">
                    Access anywhere, any device
                  </h3>
                  <div className="mt-6 flex justify-center">
                    <img
                      src="https://placehold.co/48x48?text=Access+anywhere&font=roboto"
                      alt="Access anywhere illustration"
                      className="h-48 w-48 object-contain"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-background z-10 w-full rounded-[32px] border-2 text-center md:absolute md:top-20 md:w-[38%]"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="rounded-[32px] p-8 shadow-[0_8px_0px_0px_rgba(0,0,0,1)] transition-transform">
                  <div className="text-xs font-medium text-amber-600">YOU ONLY NEED ONE APP</div>
                  <h3 className="mt-2 px-6 text-[28px] leading-tight font-semibold">
                    Quick snap-and- save process
                  </h3>
                  <div className="mt-6 flex justify-center">
                    <img
                      src="https://placehold.co/48x48?text=Quick%20snap%20illustration&font=roboto"
                      alt="Quick snap illustration"
                      className="h-48 w-48 object-contain"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-background w-full rounded-[32px] border-2 text-center md:absolute md:top-12 md:right-0 md:w-[35%]"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1, rotate: [0, 0, 6] }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="rounded-[32px] p-8 shadow-[0_8px_0px_0px_rgba(0,0,0,1)] transition-transform">
                  <div className="text-xs font-medium text-amber-600">YOU ONLY NEED ONE APP</div>
                  <h3 className="mt-2 px-6 text-[28px] leading-tight font-semibold">
                    Secure digital backup always
                  </h3>
                  <div className="mt-6 flex justify-center">
                    <img
                      src="https://placehold.co/48x48?text=Secure+Digital+Backup&font=roboto"
                      alt="Secure backup illustration"
                      className="h-48 w-48 object-contain"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
