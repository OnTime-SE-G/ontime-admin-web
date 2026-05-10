"use client";

import { Badge, Lock } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";

export function LoginCard() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      await signIn("keycloak", { callbackUrl: "/dashboard" });
    } catch {
      toast.error("Authentication failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="w-full max-w-md overflow-hidden rounded-xl bg-surface-container-lowest shadow-soft">
      <div className="border-b border-surface-container px-8 pb-6 pt-10 text-center">
        <h1 className="mb-2 bg-gradient-to-br from-primary to-primary-container bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
          On Time
        </h1>
        <p className="text-sm text-on-surface-variant">
          Operator Authentication Portal
        </p>
      </div>

      <div className="px-8 py-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="operator-id"
              className="mb-2 block text-sm font-semibold text-on-surface"
            >
              Operator ID
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant">
                <Badge size={17} />
              </div>
              <input
                id="operator-id"
                type="text"
                disabled
                placeholder="Provided by Keycloak"
                className="block w-full rounded-lg border-0 bg-surface-container-high py-3 pl-10 pr-3 text-sm text-on-surface-variant placeholder:text-on-surface-variant outline-none opacity-60"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="passcode"
              className="mb-2 block text-sm font-semibold text-on-surface"
            >
              Passcode
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant">
                <Lock size={17} />
              </div>
              <input
                id="passcode"
                type="password"
                disabled
                placeholder="Provided by Keycloak"
                className="block w-full rounded-lg border-0 bg-surface-container-high py-3 pl-10 pr-3 text-sm text-on-surface-variant placeholder:text-on-surface-variant outline-none opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-br from-primary to-primary-container px-4 py-3 text-sm font-semibold text-white shadow-soft transition-all hover:from-primary-container hover:to-primary active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Redirecting to login..." : "Initiate Shift"}
          </button>
        </form>
      </div>

      <div className="rounded-b-xl bg-surface-container-low px-8 py-4 text-center">
        <p className="text-xs text-on-surface-variant">
          Secure access for authorized personnel only. Need help?
          <br />
          Contact{" "}
          <span className="font-medium text-primary">Dispatch Support</span>.
        </p>
      </div>
    </main>
  );
}
