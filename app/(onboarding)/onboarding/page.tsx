import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

async function handleCompleteOnboarding() {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.auth.updateUser({
    data: { has_onboarded: true },
  });

  if (error) {
    console.error("Erro ao salvar onboarding:", error.message);

    throw new Error(error.message);
  }

  redirect("/dashboard");
}

export default async function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="mx-auto w-full max-w-4xl rounded-xl text-zinc-900">
        <h1 className="mx-auto text-center text-3xl font-semibold lg:text-6xl">
          Seja bem-vindo ao Sheetfy
        </h1>

        <h2 className="mx-auto mt-1 mb-10 max-w-4xl text-center text-base font-medium text-zinc-600 lg:mt-7 lg:text-xl">
          Transforme suas planilhas em APIs REST em segundos. Sem código, sem deploy, sem
          complicação.
        </h2>

        <form className="flex" action={handleCompleteOnboarding}>
          <Button
            type="submit"
            className="mx-auto flex cursor-pointer rounded-full border-black px-5 py-10 text-base font-medium sm:px-10 sm:py-10 sm:text-xl"
          >
            Criar Minha Primeira API
          </Button>
        </form>
      </div>
    </div>
  );
}
