import SavedReadings from "@/components/account/SavedReadings";
export const dynamic = "force-dynamic";
export default async function SavedReadingPage({ params }: { params: Promise<{ id: string }> }) { return <SavedReadings id={(await params).id} />; }
