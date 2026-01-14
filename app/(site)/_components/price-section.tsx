import { Button } from "@/components/ui/button";
import { plans } from "@/lib/plans";
import { IconCircleCheck } from "@tabler/icons-react";
import Link from "next/link";

export function PriceSection() {
  return (
    <div className="container mx-auto mt-30">
      <p className="mx-auto max-w-xl text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
        Preços transparentes, sem taxas extras.
      </p>
      <div className="mt-15 grid grid-cols-3 gap-7">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="from-primary/5 to-card bg-card relative flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-linear-to-t p-8 shadow-xs"
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary flex items-center gap-1 rounded-full px-4 py-1 text-xs font-semibold text-white">
                  🔥 Mais Popular
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-x-4">
              <h3
                id="tier-hobbyist-name"
                className="text-xl font-semibold tracking-tight text-pretty sm:text-2xl"
              >
                {plan.name}
              </h3>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <p className="flex items-baseline gap-x-1">
                <span className="tier-price text-3xl font-semibold tracking-tight">
                  R${plan.price}
                </span>
                <span className="tier-suffix text-muted-foreground text-xs font-medium">
                  {plan.period}
                </span>
              </p>
              <p className="text-secondary-foreground text-sm text-pretty">{plan.description}</p>
            </div>
            <ul role="list" className="text-secondary-foreground space-y-4 font-medium">
              {plan.features.map((feature) => (
                <li key={feature.text} className="flex gap-x-3">
                  <IconCircleCheck className="stroke-primary" />
                  <span className="mt-0.5 flex items-center gap-3 text-zinc-900">
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/planos" className="mt-5 w-full">
              <Button className="mx-auto flex w-full cursor-pointer rounded-full border-black px-5 py-10 text-base font-medium sm:px-8 sm:py-8 sm:text-lg">
                Criar Minha Primeira API
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
