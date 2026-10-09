import { toast } from "@/components/ui/toast";
import { extendRental, submitPin, updateBookingStatus } from "@/services/booking";
import { createBooking, getBooking, getBookingId } from "@/services/booking";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

export function useBooking(status?: string, currentPage?: number, isRefundable?: string) {
  return useQuery({
    queryKey: ["bookings", status, currentPage, isRefundable],
    queryFn: () => getBooking(status, currentPage, isRefundable),
  });
}

export function useGetBookingId(id?: string) {
  return useQuery({
    queryKey: ["bookingId", id],
    queryFn: () => getBookingId(id),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const t = useTranslations("translation");
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["listingBookedDates"],
      });

      toast({ description: t("bookingRequestSubmittedSuccessfully") })
      if (variables.redirectOnSuccess !== false) {
        router.replace(`/booking/pending`);
      }

    },
    onError: (error) => {
      toast({
        description: getApiErrorMessage(error, t("somethingWentWrong")),
        variant: "destructive",
      });
    },
  });
}

export function useUpdateBookingStatus() {
  const t = useTranslations("translation");
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBookingStatus,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["bookings"] }),
        queryClient.invalidateQueries({ queryKey: ["bookingId"] }),
        queryClient.invalidateQueries({ queryKey: ["listingBookedDates"] }),
      ]);
      toast({ description: t("bookingCancelledSuccessfully") })
      router.replace(`/booking/all`);
    },
    onError: (error) => {
      toast({
        title: t("bookingStatusUpdateFailed"),
        description: getApiErrorMessage(error, t("somethingWentWrong")),
        variant: "destructive",
      });
    },
  });
}

export function useSubmitPin() {
  const t = useTranslations("translation");
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitPin,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      toast({ description: data?.message || t("pinSubmittedSuccessfully") })
      router.push('/booking/in_progress')
    },
    onError: (error) => {
      toast({
        description: getApiErrorMessage(error, t("somethingWentWrong")),
        variant: "destructive",
      });
    },
  });
}

export function useExtendRental() {
  const t = useTranslations("translation");
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: extendRental,
    onSuccess: () => {
      toast({ description: t("extensionRequestCreatedSuccessfully") })
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      queryClient.invalidateQueries({ queryKey: ["bookingId"] })
    },
    onError: (error) => {
      toast({
        description: getApiErrorMessage(error, t("somethingWentWrong")),
        variant: "destructive",
      });
    },
  });
}
