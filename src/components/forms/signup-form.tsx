"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Register, RegisterSchema } from "@/validations/auth";
import { useSignup } from "@/hooks/useAuth";
import Input from "../ui/auth-input";
import Button from "../auth/button";
import Header from "../auth/header";
import Footer from "../auth/footer";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { useTranslations } from "next-intl";

const SignUpForm = () => {
  const t = useTranslations("translation");
  const { mutate, isPending } = useSignup();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Register>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
    },
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem("email");

    if (savedEmail) {
      setValue("email", savedEmail);
    }
  }, [setValue]);

  const onSubmit = async (formData: Register) => {
    mutate(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl px-4 py-8 sm:p-6 w-full lg:w-[120%]">
      <Header
        title={t("createNewAccount")}
        description={t("signupDescription")}
        className="mb-4"
      />

      <form onSubmit={handleSubmit(onSubmit)} className={`${errors.email || errors.password ? 'space-y-2' : 'space-y-3'}`}>
        <Input
          label={t("name")}
          placeholder={t("enterYourName")}
          type="text"
          register={register("name")}
          error={errors.name?.message}
        />

        <Input
          label={t("email")}
          type="email"
          placeholder={t("enterYourEmail")}
          register={register("email")}
          error={errors.email?.message}
        />

        <Input
          label={t("password")}
          type="password"
          placeholder={t("enterYourPassword")}
          register={register("password")}
          error={errors.password?.message}
        />

        <Input
          label={t("confirmPassword")}
          type="confirmPassword"
          placeholder={t("confirmYourPassword")}
          register={register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        <Button
          text={t("signUp")}
          className="mt-5"
          isPending={isPending}
        />

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300" />
          <span className="mx-2 text-gray-500 text-sm">{t("or")}</span>
          <div className="flex-grow border-t border-gray-300" />
        </div>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-full py-2 hover:bg-gray-100 transition-all"
        >
          <FcGoogle className="text-2xl" />
          <span className="text-gray-700 text-sm font-medium">
            {t("signInWithGoogle")}
          </span>
        </button>
      </form>

      <Footer
        linkHref="/auth/login"
        linkText={t("loginHere")}
        messageText={t("alreadyHaveAccount")}
      />
    </div>
  );
};

export default SignUpForm;
