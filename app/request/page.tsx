import type { Metadata } from "next";
import RequestForm from "@/components/views/RequestForm";

export const metadata: Metadata = {
  title: "Custom Beat Request",
  description: "Commission a custom beat from Ibiga Beatz — share your vision and a voice idea.",
};

export default function RequestPage() {
  return <RequestForm />;
}
