"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddChannelSchema, addChannelSchema } from "@/validations/channel.z";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import Spinner from "./ui/spinner";
import useChatStore from "@/lib/stores/use-chat";
import apiClient from "@/lib/api";
import { useEffect, useState } from "react";
import { useToast } from "./ui/use-toast";
import { useGeolocated } from "react-geolocated";

export default function AddChannelForm() {
  const { coords: locationCoords } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
  });
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { setMyChannels, myChannels } = useChatStore();
  const form = useForm<AddChannelSchema>({
    resolver: zodResolver(addChannelSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (!locationCoords) return;
    form.setValue("location.lat", locationCoords.latitude);
    form.setValue("location.lng", locationCoords.longitude);
  }, [form, locationCoords]);

  const handleSubmit = async (values: AddChannelSchema) => {
    if (values.name.trim() === "") return;
    if (!locationCoords) {
      return toast({
        title: "Allow location to continue.",
        variant: "destructive",
      });
    }
    const res = await apiClient.channels.create(values, values.location);
    if (res.succeed && res.data) {
      setMyChannels((prevChannels) => [res.data, ...prevChannels]);
      form.reset({
        name: undefined,
      });
      setOpen(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="icon" disabled={!myChannels}>
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Channel</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full col-span-full">
                    <FormLabel>Channel Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location.lat"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location.lng"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-5 flex items-center justify-end">
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting || !form.formState.isDirty
                }
              >
                {form.formState.isSubmitting ? (
                  <Spinner className="w-5 h-5" />
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
