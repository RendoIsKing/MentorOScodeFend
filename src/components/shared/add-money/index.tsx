import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ABeeZee } from "next/font/google";
import { Button } from "@/components/ui/button";
import { RadioButtonGroup } from "@/components/postInteraction";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface ITipDialogProps {
  showText?: boolean;
}

const AddMoneyComponent: React.FC<ITipDialogProps> = ({ showText = false }) => {
  const [open, setOpen] = useState(false);

  const schema = z.object({
    amount: z
      .number()
      .min(1)
      .max(100)
      .multipleOf(0.01, { message: "Upto 2 digits allowed" }),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 1,
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-3/4 hover:bg-foreground/80 bg-foreground text-secondary">
            Add Money
          </Button>
        </DialogTrigger>
        <DialogContent className="lg:w-[32rem] rounded-md p-0 border-0">
          <DialogHeader>
            <div className="flex justify-between border-b border-secondary align-middle text-start px-3 py-2">
              <DialogTitle
                className={`w-full text-base pb-2 ${fontItalic.className}`}
              >
                Add Money
              </DialogTitle>
            </div>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col px-4 gap-4"
            >
              <RadioButtonGroup label="Add Amount" />
              <Button className="mb-8" type="submit">
                Add
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddMoneyComponent;
