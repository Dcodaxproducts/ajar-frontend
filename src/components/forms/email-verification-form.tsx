"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import Button from "../auth/button"
import Header from "../auth/header"
import Footer from "../auth/footer"
import Input from "../ui/auth-input"
import CongratulationsDialog from "../dialogs/congratulations"
import { toast } from "../ui/toast"
import { useTwoFactorVerify } from "@/hooks/useTwoFactor"
import { useResendVerificationByEmail, useVerificationByEmail } from "@/hooks/useVerification"
import { Verification, VerificationSchema } from "@/validations/auth"

const EmailVerificationForm = ({
    type,
    title,
    description,
    buttonText,
    showBackToSignUp = false,
}: {
    type?: string
    title?: string
    description?: string
    buttonText?: string
    showBackToSignUp?: boolean
}) => {
    const router = useRouter()
    const t = useTranslations("translation")
    const { mutate: verifyUserByEmail, isPending } = useVerificationByEmail()
    const { mutate: resendVerificationByEmail, isPending: isResending } = useResendVerificationByEmail()
    const { mutate: verifyTwoFactor, isPending: isVerifying } = useTwoFactorVerify()

    const [timer, setTimer] = useState(0)
    const [dialogOpen, setDialogOpen] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<Verification>({
        resolver: zodResolver(VerificationSchema),
        defaultValues: { otp: "" }
    })

    const onSubmit = (formData: Verification) => {
        const email = localStorage.getItem("email")

        if (title) {
            verifyTwoFactor({ token: formData.otp }, {
                onSuccess: () => {
                    toast({
                        title: t("twoFactorEnabled"),
                        variant: "default",
                    })
                    router.replace("/two-factor")
                },
            })
            return
        }

        verifyUserByEmail(
            { otp: formData.otp, email: email as string },
            {
                onSuccess: (data) => {
                    if (type === "password") {
                        router.replace("/auth/reset-password")
                        toast({
                            title: t("emailVerifiedSuccessfully"),
                            variant: "default",
                        })
                        return
                    }

                    localStorage.setItem("token", data.token)
                    setDialogOpen(true)
                },
            }
        )
    }

    const handleResendOtp = async () => {
        const email = localStorage.getItem("email")
        resendVerificationByEmail(email as string)
        setTimer(60)
        localStorage.setItem("otpTimer", (Date.now() + 60000).toString())
    }

    useEffect(() => {
        const savedExpiry = localStorage.getItem("otpTimer")
        if (savedExpiry) {
            const remaining = Math.floor((Number(savedExpiry) - Date.now()) / 1000)
            if (remaining > 0) setTimer(remaining)
            else localStorage.removeItem("otpTimer")
        }

        if (timer <= 0) return
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    localStorage.removeItem("otpTimer")
                    clearInterval(interval)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [timer])

    return (
        <>
            <CongratulationsDialog open={dialogOpen} />

            <div className={`bg-white rounded-md shadow-md border border-gray-100 px-4 py-8 sm:py-10 sm:px-6 w-full ${title ? "lg:w-[400px]" : "lg:w-[333px]"}`}>
                <Header
                    title={title || t("emailVerification")}
                    description={description || t("emailVerificationDescription")}
                    className="mb-6"
                />

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    <Input
                        label={t("enterOtp")}
                        type="number"
                        placeholder={title ? "123456" : "1234"}
                        register={register("otp")}
                        error={errors.otp?.message}
                    />

                    {!title && (
                        <p className="text-xs text-center text-gray-500">
                            {t("didntReceiveCode")}{" "}
                            {timer > 0 ? (
                                <span className="text-gray-400">
                                    {t("resendIn")} <strong>{timer}s</strong>
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={isResending}
                                    className="text-aqua font-medium hover:underline disabled:opacity-60"
                                >
                                    {isResending ? t("resending") : t("resend")}
                                </button>
                            )}
                        </p>
                    )}

                    <Button text={buttonText || t("verifyAccount")} isPending={isPending || isVerifying} />
                </form>

                {showBackToSignUp && (
                    <Footer
                        linkHref="/auth/signup"
                        linkText={t("backToSignUp")}
                    />
                )}
            </div>
        </>
    )
}

export default EmailVerificationForm
