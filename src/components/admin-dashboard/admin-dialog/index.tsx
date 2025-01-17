import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminForm from "../admin-form";

export function AdminDialog() {
  const router = useRouter();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Click Me</Button>
      </DialogTrigger>
      <DialogContent className="">
        <AdminForm />
      </DialogContent>
    </Dialog>
  );
}
