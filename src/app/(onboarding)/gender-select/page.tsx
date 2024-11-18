import { GenderSelectForm } from "@/components/gender-select";
import PageHeader from "@/components/shared/page-header";

export default function GenderSelectPage() {
  return (
    <>
      <PageHeader
        title="What’s your Gender?"
        description="Specify your gender"
      />
      <GenderSelectForm />
    </>
  );
}
