import ContentPage from "@/components/content/ContentPage";
import DownloadChecklistButton from "@/components/content/DownloadChecklistButton";

export default function ChecklistPage() {
  return (
    <div>
      <ContentPage slug="checklist" />
      <div className="mx-auto max-w-3xl px-4 pb-16">
        <DownloadChecklistButton />
      </div>
    </div>
  );
}
