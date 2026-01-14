import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="container mx-auto mt-20 rounded-3xl px-4">
      <div className="inset-px mx-auto rounded-3xl border px-10 py-20 shadow-lg md:px-20">
        <h2 className="mx-auto max-w-4xl text-center text-4xl leading-15 font-bold text-zinc-900">
          Pronto para transformar suas planilhas?
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-center text-lg font-medium text-zinc-900">
          Junte-se a milhares de desenvolvedores que estão criando conteúdo mais rapidamente com as
          Planilhas de API.
        </p>
        <Link href="/login" className="mx-auto mt-7 block w-fit">
          <Button className="mx-auto flex cursor-pointer rounded-full border-black px-5 py-10 text-base font-medium sm:px-10 sm:py-10 sm:text-xl">
            Criar Minha Primeira API
          </Button>
        </Link>
      </div>
    </section>
  );
}
