import { Link } from '@/i18n/navigation';
import { FooterProps } from '@/types/auth';

const Footer = ({ messageText, linkHref, linkText, className="mt-4" }: FooterProps) => {
    return (
        <div className={`text-center text-sm ${className}`}>
            {messageText && <span className="text-gray-600 me-1">{messageText}</span>}
            <Link
                href={linkHref}
                className="text-teal-500 hover:text-teal-600 font-medium">
                {linkText}
            </Link>
        </div>
    )
}

export default Footer
