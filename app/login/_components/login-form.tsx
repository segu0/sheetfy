"use client";

import { Provider } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface LoginButtonsProps {
  className?: string;
}

export function LoginForm({ className }: LoginButtonsProps) {
  const supabase = createClient();

  const handleLogin = async (provider: Provider) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const redirectTo = `${appUrl}/api/auth/callback`;

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo,
        scopes: [
          "openid",
          "email",
          "profile",
          "https://www.googleapis.com/auth/drive.readonly",
          "https://www.googleapis.com/auth/spreadsheets",
        ].join(" "),
        queryParams: {
          prompt: "consent",
          access_type: "offline",
        },
      },
    });
  };

  return (
    <div className="mt-8 flex flex-col gap-4 text-zinc-900">
      <form action={() => handleLogin("google")}>
        <button
          className={cn([
            "font-poppins flex h-12.5 w-full transform cursor-pointer items-center justify-center gap-2 border bg-white px-6 text-zinc-900 transition-all duration-300 hover:opacity-80 active:scale-90",
            className,
          ])}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            className="w-6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M43.611 20.083H42V20H24V28H35.303C33.654 32.657 29.223 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C27.059 12 29.842 13.154 31.961 15.039L37.618 9.382C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24C4 35.045 12.955 44 24 44C35.045 44 44 35.045 44 24C44 22.659 43.862 21.35 43.611 20.083Z"
              fill="#FFC107"
            ></path>
            <path
              d="M6.30603 14.691L12.877 19.51C14.655 15.108 18.961 12 24 12C27.059 12 29.842 13.154 31.961 15.039L37.618 9.382C34.046 6.053 29.268 4 24 4C16.318 4 9.65603 8.337 6.30603 14.691Z"
              fill="#FF3D00"
            ></path>
            <path
              d="M23.9999 44C29.1659 44 33.8599 42.023 37.4089 38.808L31.2189 33.57C29.1438 35.149 26.6075 36.0028 23.9999 36C18.7979 36 14.3809 32.683 12.7169 28.054L6.19495 33.079C9.50495 39.556 16.2269 44 23.9999 44Z"
              fill="#4CAF50"
            ></path>
            <path
              d="M43.611 20.083H42V20H24V28H35.303C34.5142 30.2164 33.0934 32.1532 31.216 33.571L31.219 33.569L37.409 38.807C36.971 39.205 44 34 44 24C44 22.659 43.862 21.35 43.611 20.083Z"
              fill="#1976D2"
            ></path>
          </svg>
          <span className="flex items-center justify-center gap-3 font-semibold">
            Continuar com Google
          </span>
        </button>
      </form>
    </div>
  );
}
