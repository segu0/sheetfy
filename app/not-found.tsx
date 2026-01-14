"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white text-zinc-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col px-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Gato de óculos preto e branco"
          src="/images/cat.png"
          className="mx-auto h-60 w-60 lg:h-70 lg:w-70"
        />
        <h1 className="mx-auto text-center text-3xl font-bold text-zinc-900 lg:mx-0 lg:text-5xl">
          Ops! Não conseguimos localizar esta página.
        </h1>

        <div className="mt-10 flex w-full flex-col items-center justify-center gap-y-4 lg:flex-row">
          <Button
            onClick={() => router.back()}
            className="bg-primary hover:bg-primary/80 flex w-full max-w-3xs cursor-pointer items-center justify-center gap-1.5 rounded-full px-2.5 py-9 text-center text-xl font-bold text-nowrap text-white transition-all"
          >
            Voltar
          </Button>
          <Button
            onClick={() => router.replace("/")}
            type="button"
            variant={"ghost"}
            className="hover:text-primary/80 text-primary z-20 flex w-full max-w-3xs cursor-pointer items-center justify-center rounded-full px-2.5 py-9 text-center text-xl font-bold text-nowrap transition-all hover:bg-transparent!"
          >
            Ir para Home
          </Button>
        </div>
      </div>
    </div>
  );
}
