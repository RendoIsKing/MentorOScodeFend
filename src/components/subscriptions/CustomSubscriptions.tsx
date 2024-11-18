import React from "react";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ABeeZee } from "next/font/google";
// import { permissions } from "@/schemas/subscriptions";
import { useGetAllEntitlementsQuery } from "@/redux/services/haveme/subscription";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const CustomSubscriptions = () => {
  const customSubForm = useFormContext();

  const { setValue, watch } = customSubForm;

  const watchedPermissions = watch("permissions") || [];

  const handleCheckedChange = (index) => {
    const newPermissions = watchedPermissions.map((permission, i) => ({
      ...permission,
      isAvailable:
        i === index ? !permission.isAvailable : permission.isAvailable,
    }));
    setValue("permissions", newPermissions);
  };

  return (
    <>
      <div className="grid w-full max-w-md lg:max-w-lg items-center gap-1.5">
        <Label htmlFor="name" className=" text-sm lg:text-xl">
          Subscription Plan Name
        </Label>

        <FormField
          control={customSubForm.control}
          name="title"
          render={({ field }) => (
            <FormItem className="">
              <FormControl className="">
                <div>
                  <Input
                    placeholder="Basic Plan"
                    className="border-muted-foreground text-sm h-14"
                    {...field}
                  />
                  <FormMessage />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="grid w-full max-w-md lg:max-w-lg items-center gap-1.5 mt-4">
        <Label
          htmlFor="price"
          className={`text-sm lg:text-xl lg:${fontItalic.className} lg:italic`}
        >
          Subscription Price <span className="text-primary">{`(Monthly)`}</span>
        </Label>

        <FormField
          control={customSubForm.control}
          name="price"
          render={({ field }) => (
            <FormItem className="">
              <FormControl className="">
                <div>
                  <Input
                    placeholder="$20"
                    className="border-muted-foreground text-sm h-14"
                    {...field}
                  />
                  <FormMessage />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="mt-4">
        <p className="text-sm mb-3 lg:text-lg">
          {customSubForm.getValues("permissions")?.length > 0 && "Permission"}
        </p>

        <FormField
          control={customSubForm.control}
          name="permissions"
          render={({ field }) => (
            <FormItem>
              {customSubForm
                .getValues("permissions")
                ?.map((permission, index) => (
                  <FormField
                    key={index}
                    control={customSubForm.control}
                    name={`permissions[${index}].isAvailable`}
                    render={({ field: permissionField }) => (
                      <FormItem className="flex items-center space-x-2 mt-2 border-t pt-1 border-muted-foreground/20 gap-2">
                        <FormControl>
                          <Checkbox
                            className="rounded-full size-6 mt-2"
                            checked={
                              watchedPermissions[index]?.isAvailable || false
                            }
                            onCheckedChange={() => handleCheckedChange(index)}
                          />
                        </FormControl>
                        <FormLabel className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 py-2">
                          {permission.feature}
                          <div className="text-base text-muted-foreground">
                            {watchedPermissions[index]?.isAvailable &&
                              permission.description}
                          </div>
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default CustomSubscriptions;
