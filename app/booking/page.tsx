import type { Metadata } from "next";
import BookingForm from "@/components/views/BookingForm";

export const metadata: Metadata = {
  title: "Book a Session",
  description: "Book studio time, mixing, mastering or a consultation with Ibiga Beatz.",
};

export default function BookingPage() {
  return <BookingForm />;
}
