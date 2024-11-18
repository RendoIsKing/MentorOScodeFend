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
import { useCreateUserInterestMutation } from "@/redux/admin-services/admin/admin";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function InterestDialog() {
  const { toast } = useToast();
  const [interest, setInterest] = useState("");
  const [createUserInterest] = useCreateUserInterestMutation();

  function handleInterest(e: any) {
    setInterest(e.target.value);
  }

  async function saveInterest() {
    console.log("interest", interest);
    let msg;
    if (interest) {
      try {
        const response = await createUserInterest({
          title: interest,
        })
          .unwrap()
          .then((payload) => {
            console.log("payload", payload.message);
            toast({
              variant: "success",
              title: payload.message,
            });
            return payload;
          });
        console.log("response", response);
        // console.log("message", response.data.message);
        setInterest("");
      } catch (e) {
        console.log("error", e);
        toast({
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
        });
      }
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Interests</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Interest</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Interest
            </Label>
            <Input
              id="name"
              value={interest}
              className="col-span-3"
              onChange={handleInterest}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={saveInterest}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
