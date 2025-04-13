import { SignIn as ClerkSignIn } from "@clerk/clerk-react";

export default function SignIn() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <ClerkSignIn />
    </div>
  );
} 