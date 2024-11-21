"use client";
import React from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import Logo from "@/components/shared/Logo";
import { useRouter } from "next/navigation";
import { useRegisterAdminMutation } from "@/redux/admin-services";
const FormSchema = z.object({
  password: z.string().min(5, {
    message: "Password must be at least 5 characters.",
  }),
  email: z.string().email({
    message: "Email must be a valid email address.",
  }),
});

function AdminLogin() {
  const router = useRouter();
  const [registerAdmin, { isSuccess, isError }] = useRegisterAdminMutation();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: "",
      email: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await registerAdmin(data)
      .unwrap()
      .then((res) => {
        if (res.data) {
          router.push("/admin/dashboard");
        } else {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was a problem with your request.",
          });
        }
      })
      .catch((err) => {
        console.log("error", err);
      });
  }

  return (
    <div className="flex items-center justify-center  mt-10 ms-5 gap-6 h-screen">
      <div>
        <Image
          src="/assets/images/Signup/phone1.svg"
          width={300}
          height={300}
          alt="Picture of the author"
          className="ms-10"
        />
      </div>

      <div className="">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-[600px] space-y-6"
          >
            <div className="flex flex-col gap-3 items-center h-[600px] border-2 border-muted p-8 max-w-[600px]">
              <div className="p-4">
                <Logo />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-[70%] ">
                    <FormLabel className="text-md ">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter email here"
                        {...field}
                        className="h-[60px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="w-[70%]  ">
                    <FormLabel className="text-md">Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter password here"
                        {...field}
                        className="h-[60px]"
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-8 w-[70%]">
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
      {/* <h1 className="fixed bottom-8">© 2024 HaveMe</h1> */}
    </div>
  );
}

export default AdminLogin;
