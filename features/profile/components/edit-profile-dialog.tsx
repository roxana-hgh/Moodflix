/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { updateProfile } from "../actions";
import { ProfileFormInput, updateProfileSchema, type UpdateProfileInput } from "../schema";
import { GENDER_LABELS, type Profile } from "../types";

interface EditProfileDialogProps {
  profile: Profile;
}

export function EditProfileDialog({ profile }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

 const {
  register,
  control,
  handleSubmit,
  reset,
  formState: { errors },
} = useForm<ProfileFormInput, any, UpdateProfileInput>({
  resolver: zodResolver(updateProfileSchema),
  defaultValues: {
    name: profile.name,
    age: profile.age ?? undefined,
    gender: profile.gender ?? undefined,
  },
});


function onSubmit(values: UpdateProfileInput) {
    startTransition(async () => {
      const result = await updateProfile(values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Profile updated");
      setOpen(false);
    });
}


  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="sm:ml-auto">
          <Pencil className="h-4 w-4" />
          Edit profile
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                autoComplete="off"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <FieldError errors={errors.name ? [errors.name] : undefined} />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" value={profile.email} disabled />
            </Field>

            <Field data-invalid={!!errors.age}>
              <FieldLabel htmlFor="age">Age</FieldLabel>
              <Input
                id="age"
                type="number"
                min={13}
                max={120}
                aria-invalid={!!errors.age}
                {...register("age")}
              />
              <FieldError errors={errors.age ? [errors.age] : undefined} />
            </Field>

            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Field data-invalid={!!errors.gender}>
                  <FieldLabel htmlFor="gender">Gender</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="gender" aria-invalid={!!errors.gender}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(GENDER_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={errors.gender ? [errors.gender] : undefined} />
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}