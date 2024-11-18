import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonChat() {
  return (
    <div className="flex items-center space-x-8 space-y-8">
      <Skeleton className="h-12 w-12 rounded-full ml-2" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}
