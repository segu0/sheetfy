export function ReviewsSection() {
  return (
    <section className="bg-primary mt-30 py-24 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="flex flex-col pb-10 sm:pb-16 lg:pr-8 lg:pb-0 xl:pr-20">
            <figure className="mt-10 flex flex-auto flex-col justify-between">
              <blockquote className="text-primary-foreground text-lg/8">
                <p>
                  Comecei a usar o Sheetfy para expor algumas planilhas internas como API e me
                  surpreendi com a facilidade. Não precisei configurar servidor, backend ou nada
                  complicado — conectei meu Google Sheets e já estava usando os endpoints no meu
                  projeto. É simples do jeito certo.
                </p>
              </blockquote>
              <figcaption className="mt-10 flex items-center gap-x-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="size-14 rounded-full bg-gray-800"
                  src="/images/testimonials/kris.webp"
                  alt="Imagem pessoa"
                />
                <div className="text-base">
                  <div className="text-primary-foreground font-semibold">João Martins</div>
                  <div className="mt-1 text-gray-400">@joaomcmm</div>
                </div>
              </figcaption>
            </figure>
          </div>
          <div className="flex flex-col border-t border-white/10 pt-10 sm:pt-16 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 xl:pl-20">
            <figure className="mt-10 flex flex-auto flex-col justify-between">
              <blockquote className="text-primary-foreground text-lg/8">
                <p>
                  No meu time, sempre usamos planilhas para organizar dados, mas transformar isso em
                  algo integrado com nossos sistemas era um caos. O Sheetfy resolveu isso em
                  segundos. Hoje atualizamos tudo direto pelo Google Sheets e a API reflete
                  automaticamente. Economizou tempo e reduziu erros.
                </p>
              </blockquote>
              <figcaption className="mt-10 flex items-center gap-x-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="size-14 rounded-full bg-gray-800"
                  src="/images/testimonials/mikael.webp"
                  alt="Imagem pessoa"
                />
                <div className="text-base">
                  <div className="text-primary-foreground font-semibold">Mikael Menezes</div>
                  <div className="mt-1 text-gray-400">@kaeell.mz</div>
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
