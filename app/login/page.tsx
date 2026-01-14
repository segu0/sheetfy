import { Logo } from "@/components/logo";
import { LoginForm } from "./_components/login-form";

export default async function LoginPage() {
  return (
    <div className="flex h-svh flex-col justify-between bg-white md:h-screen">
      <main className="flex flex-1 flex-col">
        <div className="flex h-screen items-center justify-center bg-zinc-50">
          <div className="flex items-center justify-center md:w-1/2">
            <div className="max-w-125 px-5">
              <div className="mb-4">
                <Logo />
                <h1 className="font-poppins mt-8 mb-4 text-[32px] font-semibold text-zinc-900">
                  Transforme suas planilhas em APIs poderosas.
                </h1>
                <p className="font-poppins font-normal text-zinc-600">
                  Crie APIs REST profissionais em segundos a partir do Google Sheets, sem código e
                  com total controle.
                </p>
              </div>
              <LoginForm />
              <p className="mt-6 text-sm text-zinc-900">
                Ao criar uma conta, você concorda com todos os nossos{" "}
                <a className="underline" href="/termos">
                  termos e condições
                </a>
                .
              </p>
            </div>
          </div>
          <div className="hidden h-full items-center justify-center bg-[url('/images/login.jpg')] bg-cover bg-center bg-no-repeat md:flex md:w-1/2"></div>
        </div>
      </main>
    </div>
  );
}
