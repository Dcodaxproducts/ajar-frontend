import EmailVerificationForm from "@/components/forms/email-verification-form";
import AuthLayout from "@/components/auth/auth-layout"
import { getLocalizedMetadata } from "@/utils/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return getLocalizedMetadata(locale, "verifyAccount");
}

const Verification = () => {
    return <AuthLayout FormComponent={<EmailVerificationForm showBackToSignUp />} />
}

export default Verification
