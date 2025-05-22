import { SignUp } from "@clerk/nextjs";
import React from "react";

const SignUpPage = () => {
  return <SignUp
  path="/sign-up"
  routing="path"
  signInUrl="/sign-in"
   />;
};

export default SignUpPage;
