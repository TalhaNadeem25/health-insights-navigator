import { SignUp as ClerkSignUp } from "@clerk/clerk-react";

export default function SignUp() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <ClerkSignUp />
    </div>
  );
} 