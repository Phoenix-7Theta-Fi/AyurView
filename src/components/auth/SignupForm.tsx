"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const firstName = formData.get("firstName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create account");
      }

      // Store the token and user data in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/treatment-plan"); // Redirect to treatment plan after successful signup
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="text-red-500 text-sm text-center">{error}</div>
      )}
      <div className="space-y-4">
        <div>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            placeholder="First name"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email address"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Password"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Confirm password"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </div>
    </form>
  );
}
