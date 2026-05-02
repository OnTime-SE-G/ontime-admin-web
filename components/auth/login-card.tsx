"use client";

import { Badge, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export function LoginCard() {
  const router = useRouter();
  const [operatorId, setOperatorId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (operatorId.trim().length < 6) {
      toast.error("Please enter a valid 6-digit operator ID");
      return;
    }

    if (!passcode.trim()) {
      toast.error("Please enter your passcode");
      return;
    }

    if (rememberMe) {
      localStorage.setItem("ontime.operatorId", operatorId);
    } else {
      localStorage.removeItem("ontime.operatorId");
    }

    toast.success("Login successful");
    router.push("/dashboard");
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
                inputMode="numeric"
                required
                value={operatorId}
                onChange={(event) => setOperatorId(event.target.value)}
                placeholder="Enter your 6-digit ID"
                className="block w-full rounded-lg border-0 bg-surface-container-high py-3 pl-10 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant outline-none transition focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
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
                required
                value={passcode}
                onChange={(event) => setPasscode(event.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-lg border-0 bg-surface-container-high py-3 pl-10 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant outline-none transition focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-0 bg-surface-container-high text-primary focus:ring-primary"
              />
              <span className="ml-2 text-on-surface-variant">Remember me</span>
            </label>
            <button
              type="button"
              className="font-medium text-primary hover:text-primary-container"
            >
              Forgot Passcode?
            </button>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-br from-primary to-primary-container px-4 py-3 text-sm font-semibold text-white shadow-soft transition-all hover:from-primary-container hover:to-primary active:scale-[0.98]"
          >
            Initiate Shift
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
