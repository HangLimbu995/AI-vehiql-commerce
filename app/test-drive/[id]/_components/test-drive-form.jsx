import useFetch from "@/hooks/use-fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

// Define Zod schema for form validation
const testDriveSchema = z.object({
  date: z.date({
    required_error: "Please select a date for your test driver",
  }),
  timeSlot: z.string({
    required_error: 'Please select a time slot",',
  }),
  notes: z.string().optional(),
});

const TestDriveForm = ({ car, testDriveInfo }) => {
  const router = useRouter();
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [showConfimation, setShowConrimation] = useState(false);
  const [bookingDetails, setBookingDetials] = useState(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolve: zodResolver(testDriveSchema),
    defaultValues: {
      date: undefined,
      timeSlot: undefined,
      notes: "",
    },
  });

  const {
    loading: bookingInProgress,
    fn: bookTestDriveFn,
    data: bookingResult,
    error: bookingError,
  } = useFetch(bookTestDrive)

  return <div></div>;
};

export default TestDriveForm;
