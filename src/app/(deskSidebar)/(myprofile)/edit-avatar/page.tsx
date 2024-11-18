import InnerPageHeader from "@/components/shared/inner-page-header";
import TrainingData from "@/components/trainingData/tdata";


export default function TrainingDataPage() {
    return (
      <>
      <div className="h-screen">
        <InnerPageHeader showBackButton={true} title="Christina Jack" />
        <TrainingData/>
      </div>
      </>
    );
  }