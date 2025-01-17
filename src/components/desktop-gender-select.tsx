"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useState } from "react"

const FormSchema = z.object({
  genderType: z
    .string({
      required_error: "Please select your gender.",
    })
    ,
})

export function DGenderSelectForm() {
  const [otherGender, setOtherGender] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    //console.log(data);
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="genderType"
          render={({ field }) => (
           
            <FormItem>
                <>
            {
            field.value === 'other' ?(
                setOtherGender(true)
                
            ):(
               <></>
            )
             
            }
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a verified email to display" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">MALE</SelectItem>
                  <SelectItem value="female">FEMALE</SelectItem>
                  <SelectItem value="other">OTHER</SelectItem>
                </SelectContent>
              </Select>
              
               
               </>
            </FormItem>

             
          )}
        />
        { 
                 
                 otherGender?(
                   <>
                    <FormLabel>Hello</FormLabel>
                   </>
                 ):(<>
                 </>)
              }

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
