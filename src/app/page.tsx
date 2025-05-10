import { Metadata } from "next";
import AuthContainer from "@/components/auth/AuthContainer";

export const metadata: Metadata = {
  title: "AyurView - Login",
  description: "Login to AyurView to access your personalized Ayurvedic healthcare dashboard",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <main>
        <AuthContainer />
      </main>
    </div>
  );
}
