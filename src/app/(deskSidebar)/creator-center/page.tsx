import CreatorCenter from "@/components/creator-center";

function CreateCenterPage() {
  return (
    <div className="relative">
      <CreatorCenter />
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="rounded-xl border bg-card px-6 py-4 shadow">
          <h2 className="text-xl font-semibold">Creator Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Coming soon</p>
        </div>
      </div>
    </div>
  );
}
export default CreateCenterPage;

