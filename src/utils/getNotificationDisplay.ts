import type { Notification } from "../types/notification";

type DisplayLocale = "en" | "ar";

type NotificationDisplay = {
  title: string;
  message: string;
  locale: DisplayLocale;
  dir: "ltr" | "rtl";
};

const fallback = {
  en: {
    title: "Payment confirmed",
    message: "Your payment is secured while the host reviews your booking.",
    item: "your booking",
  },
  ar: {
    title: "تم تأكيد الدفع",
    message: "تم تأمين دفعتك إلى حين مراجعة المضيف لحجزك.",
    item: "حجزك",
  },
} as const;

const normalizeLocale = (value: unknown): DisplayLocale =>
  typeof value === "string" && value.toLowerCase().startsWith("ar") ? "ar" : "en";

const optionalText = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const isLegacyPaymentHeld = (notification: Notification): boolean => {
  const bookingId = optionalText(notification.data?.bookingId);
  const explicitPaymentEvent = notification.data?.type === "payment_held" ||
    notification.data?.eventType === "payment-held" ||
    notification.title === "Payment Hold Confirmed";
  return explicitPaymentEvent && (
    notification.title === "Payment Hold Confirmed" ||
    Boolean(bookingId && notification.message.includes(bookingId))
  );
};

export const getNotificationDisplay = (
  notification: Notification,
  activeLocale?: string
): NotificationDisplay => {
  const locale = normalizeLocale(notification.data?.locale ?? activeLocale);
  const text = fallback[locale];
  const structuredTitle = optionalText(notification.data?.displayTitle);
  const structuredMessage = optionalText(notification.data?.displayMessage);

  if (isLegacyPaymentHeld(notification)) {
    const itemName = optionalText(notification.data?.itemName) ?? text.item;
    const dateRange = optionalText(notification.data?.dateRange);
    return {
      title: structuredTitle ?? text.title,
      message: structuredMessage ?? [text.message, itemName, dateRange]
        .filter(Boolean)
        .join(" · "),
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
    };
  }

  return {
    title: structuredTitle ?? notification.title,
    message: structuredMessage ?? notification.message,
    locale,
    dir: locale === "ar" ? "rtl" : "ltr",
  };
};
