"use client";

import Image from "@/components/MyImage";
import { BellIcon, ClockIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import LogoutButton from "./auth/logout-btn";
import { profileMenuItems } from "@/constants/profile";
import Dropdown from "@/components/ui/dropdown";
import { useUser } from "@/hooks/useAuth";
import { Skeleton } from "./ui/skeleton";
import { timeAgo } from "@/utils/timeAgo";
import { useGetUnreadCount, useMarkAllRead, useNotification } from "@/hooks/useNotification";
import { Notification } from "@/types/notification";
import { getNotificationLink } from "@/utils/getNotificationLink";
import { useGetBusinessSettings } from "@/hooks/useBusinessSettings";
import { useLocale, useTranslations } from "next-intl";
import { getNotificationDisplay } from "@/utils/getNotificationDisplay";

const NotificationContent = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { data, isLoading } = useNotification({});
  const t = useTranslations("translation");
  const locale = useLocale();
  const notifications = data?.data;

  return (
    <div
      {...props}
      className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 md:w-80"
    >
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <p className="text-base font-semibold text-gray-900">{t("notifications")}</p>
        <Link
          href="/notifications"
          className="text-xs text-aqua cursor-pointer"
        >
          {t("showAll")}
        </Link>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : notifications && notifications.length > 0 ? (
          notifications.map((item: Notification) => {
            const display = getNotificationDisplay(item, locale);
            return (
            <Link
              key={item._id}
              href={getNotificationLink(item)}
              lang={display.locale}
              dir={display.dir}
              className={`block px-4 py-3 transition-colors duration-150 ${item.isRead
                ? "text-gray-700 hover:bg-gray-50"
                : "bg-green-50/50 text-gray-900 hover:bg-aqua/10"
                }`}
            >
              <p className="text-sm font-medium leading-snug">{display.title}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {display.message}
              </p>
              <div className="flex items-center text-xs text-gray-400 mt-1">
                <ClockIcon className="h-3 w-3 mr-1" />
                {timeAgo(item?.createdAt?.toString() || "")}
              </div>
            </Link>
            );
          })
        ) : (
          <p className="px-4 py-3 text-sm text-gray-500">{t("noNewNotifications")}</p>
        )}
      </div>
    </div>
  );
};

export default function ProfileDropdown() {
  const { data: user = {}, isLoading } = useUser();
  const t = useTranslations("translation");
  const { data: termsAndConditionsData } = useGetBusinessSettings("termsAndConditions");
  const { mutate } = useMarkAllRead();

  const { data: unreadData } = useGetUnreadCount();
  const unreadCount = unreadData?.data?.count || 0;

  const getInitial = (name = "") => name.charAt(0).toUpperCase();

  const ProfileImage = ({ size = 26 }: { size?: number }) => {
    const imageWrapperStyle = { width: size, height: size };

    if (isLoading) {
      return <Skeleton className="rounded-full" style={imageWrapperStyle} />;
    }

    if (user?.profilePicture) {
      return (
        <div
          style={imageWrapperStyle}
          className="relative rounded-full overflow-hidden cursor-pointer"
        >
          <Image
            src={user.profilePicture.startsWith("http") ? user.profilePicture : process.env.NEXT_PUBLIC_API_BASE_URL + user.profilePicture}
            alt={user?.name || "User Avatar"}
            width={size}
            height={size}
            className="object-cover rounded-full w-full h-full"
          />
        </div>
      );
    }

    return (
      <div
        style={imageWrapperStyle}
        className="flex items-center justify-center rounded-full bg-aqua text-white text-xs font-semibold flex-shrink-0 cursor-pointer"
      >
        {getInitial(user?.name)}
      </div>
    );
  };

  const notificationButton = (
    <button
      className="rounded-full cursor-pointer text-aqua hover:bg-gray-200 transition-colors flex"
      aria-label={t("notifications")}
      onClick={() => mutate()}
    >
      <BellIcon className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ring-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );

  const profileButton = <ProfileImage size={26} />;

  const profileContent = (
    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 md:w-64">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="relative ">
            <ProfileImage size={40} />
            {!isLoading && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <>
                <Skeleton className="h-3 w-20 mb-1 rounded" />
                <Skeleton className="h-2 w-32 rounded" />
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-900 truncate capitalize">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="py-1">
        {profileMenuItems.map((item, index) => (
          <Link
            key={index}
            href={
              item.key === "termsAndConditions"
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${termsAndConditionsData?.pageSettings?.fileUrl}`
                : item.href
            }
            target={item.key === "termsAndConditions" ? "_blank" : undefined}
            className="block px-4 py-2 font-light text-sm text-black hover:bg-gray-50 hover:text-gray-900"
          >
            {t(item.key)}
          </Link>
        ))}
        <LogoutButton />
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-2 bg-white rounded-full px-2 py-1 w-fit hover:shadow-md transition-shadow duration-200">
      <Dropdown button={notificationButton}>
        <NotificationContent />
      </Dropdown>

      <Dropdown button={profileButton}>
        {profileContent}
      </Dropdown>
    </div>
  );
}
