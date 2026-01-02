// import { fontItalic }/ from "@/app/layout";
import React from "react";
import { ABeeZee } from "next/font/google";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface IPageHeaderProps {
  title: string;
  description: string;
  showBackButton?: boolean;
  backHref?: string;
}

const PageHeader: React.FC<IPageHeaderProps> = ({ title, description, showBackButton = false, backHref }) => {
  const router = useRouter();
  const onBack = () => {
    // In PWAs there may be no history, so prefer explicit fallback.
    if (backHref) {
      router.push(backHref);
      return;
    }
    router.back();
  };
  return (
    <div className="px-4 pt-4">
      {showBackButton ? (
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
      ) : null}
      <h1 className={`${fontItalic.className} text-3xl`}>{title}</h1>
      <p className="text-muted-foreground mt-2">{description}</p>
    </div>
  );
};

export default PageHeader;
