"use client";

import { useState } from "react";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

interface AuthModalProps {
  isOpen: boolean;
  initialView: "login" | "signup";
  onClose: () => void;
}

export default function AuthModal({
  isOpen,
  initialView,
  onClose,
}: AuthModalProps) {
  const [currentView, setCurrentView] = useState<"login" | "signup">(
    initialView
  );

  if (!isOpen) return null;

  return (
    <>
      <LoginModal
        isOpen={isOpen && currentView === "login"}
        onClose={onClose}
        onSignupClick={() => setCurrentView("signup")}
      />
      <SignupModal
        isOpen={isOpen && currentView === "signup"}
        onClose={onClose}
        onLoginClick={() => setCurrentView("login")}
      />
    </>
  );
}
