export default function PreonboardingPage() {
  const Conversation = require("@/components/preonboarding/Conversation").default;
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-4">Start med The PT</h1>
      <Conversation />
    </div>
  );
}


