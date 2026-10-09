"use client"

import { useState } from 'react'
import { Clock, BellOff } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Header from '@/components/ui/header'
import { useNotification } from "@/hooks/useNotification"
import { timeAgo } from "@/utils/timeAgo"
import Link from 'next/link'
import { Notification } from '@/types/notification'
import { getNotificationLink } from '@/utils/getNotificationLink'
import Pagination from "@/components/ui/pagination"
import { useLocale, useTranslations } from 'next-intl'
import { getNotificationDisplay } from '@/utils/getNotificationDisplay'

const Notifications = () => {
    const t = useTranslations("translation")
    const locale = useLocale()
    const [currentPage, setCurrentPage] = useState(1)
    const limit = 10

    const { data, isLoading } = useNotification({
        page: currentPage,
        limit: limit
    });

    const notifications = data?.data
    const totalCount = data?.total || 0
    const totalPages = Math.ceil(totalCount / limit)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <div className="min-h-screen">
            <Header title={t("notifications")} />

            {isLoading ? (
                <div className="max-w-2xl mx-auto p-6 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-4 p-4 border rounded-2xl bg-white shadow-sm">
                            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                            <div className="space-y-2 w-full">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="max-w-2xl mx-auto pt-6 px-6">
                    <div className="space-y-3">
                        {notifications && notifications.length > 0 ? (
                            <>
                                {notifications.map((item: Notification) => {
                                    const display = getNotificationDisplay(item, locale)
                                    return (
                                    <Link
                                        key={item._id}
                                        href={getNotificationLink(item)}
                                        lang={display.locale}
                                        dir={display.dir}
                                        className="block group"
                                    >
                                        <Card className={`border-none shadow-sm rounded-2xl transition-all duration-200 group-hover:shadow-md ${!item.isRead ? 'bg-blue-50/40 ring-1 ring-blue-100' : 'bg-white'}`}>
                                            <CardContent className="p-4">
                                                <div className="flex gap-4">
                                                    <div className="relative">
                                                        <div className={`p-2 rounded-full ${!item.isRead ? 'bg-aqua/10 text-aqua' : 'bg-slate-100 text-slate-400'}`}>
                                                            <Clock className="w-5 h-5" />
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex justify-between items-start">
                                                            <h3 className={`text-sm tracking-tight ${!item.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                                {display.title}
                                                            </h3>
                                                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2 uppercase">
                                                                {timeAgo(item?.createdAt?.toString() || "")}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 leading-relaxed">
                                                            {display.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                    )
                                })}

                                {/* Pagination Component Added Here */}
                                {totalPages > 1 && (
                                    <div className="pt-6">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            // Empty State
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="bg-slate-100 p-4 rounded-full">
                                    <BellOff className="w-8 h-8 text-slate-400" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-lg font-semibold text-slate-900">{t("allCaughtUp")}</h2>
                                    <p className="text-sm text-slate-500 max-w-[200px]">
                                        {t("noNotificationsRightNow")}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Notifications
