import { getSavedCars } from "@/actions/car-listing";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SavedCarsList from "./_components/saved-cars-list";

export const metadata = {
  title: "Saved Cars | Vehiql",
  description: "View Your saved cars & Favorites",
};

export default async function SavedCarsPage() {
  // Check authentication on server
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect=/saved-cars");
  }

  // Fetch saved cars on the server
  const savedCarsResult = await getSavedCars();

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-6xl gradient-title">Your Saved Cars</h1>
      <SavedCarsList initialData={savedCarsResult} />
    </div>
  );
}
