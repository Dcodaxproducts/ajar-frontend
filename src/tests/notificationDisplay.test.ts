import assert from "node:assert/strict";
import test from "node:test";
import { getNotificationDisplay } from "../utils/getNotificationDisplay.ts";
import type { Notification } from "../types/notification.ts";

const bookingId = "507f1f77bcf86cd799439011";
const base = {
  _id: "notification-1",
  user: "user-1",
  type: "booking" as const,
  isRead: false,
  createdAt: "2026-10-09T00:00:00.000Z",
  updatedAt: "2026-10-09T00:00:00.000Z",
};

test("legacy payment-held history never renders its Mongo booking ID", () => {
  const notification: Notification = {
    ...base,
    title: "Payment Hold Confirmed",
    message: `Your payment for booking "${bookingId}" has been held successfully.`,
    data: { bookingId, type: "payment_held" },
  };
  const display = getNotificationDisplay(notification, "en");
  assert.equal(display.title, "Payment confirmed");
  assert.doesNotMatch(display.message, new RegExp(bookingId));
  assert.equal(notification.data.bookingId, bookingId);
});

test("structured backend display fields are preferred and Arabic direction is preserved", () => {
  const notification: Notification = {
    ...base,
    title: "old title",
    message: "old message",
    data: {
      bookingId,
      locale: "ar",
      displayTitle: "تم تأكيد الدفع",
      displayMessage: "تم تأمين دفعتك للكاميرا.",
      itemName: "كاميرا",
      dateRange: "١٢ أكتوبر ٢٠٢٦ – ١٥ أكتوبر ٢٠٢٦",
    },
  };
  const display = getNotificationDisplay(notification, "en");
  assert.equal(display.title, notification.data.displayTitle);
  assert.equal(display.message, notification.data.displayMessage);
  assert.equal(display.dir, "rtl");
  assert.equal(display.locale, "ar");
});

test("fallback sanitization is limited to explicit payment-held events", () => {
  const notification: Notification = {
    ...base,
    title: "Message received",
    message: `The customer typed ${bookingId}`,
    type: "system",
    data: { type: "chat", bookingId },
  };
  const display = getNotificationDisplay(notification, "en");
  assert.equal(display.message, notification.message);
});

test("modern payment-held copy with item and dates is rendered unchanged", () => {
  const notification: Notification = {
    ...base,
    title: "Payment confirmed",
    message: "Your payment for Canon EOS R5 (12 Oct 2026 – 15 Oct 2026) is secured.",
    data: { bookingId, type: "payment_held", eventType: "payment-held", itemName: "Canon EOS R5" },
  };
  const display = getNotificationDisplay(notification, "en");
  assert.equal(display.message, notification.message);
  assert.match(display.message, /Canon EOS R5/);
  assert.doesNotMatch(display.message, new RegExp(bookingId));
});
