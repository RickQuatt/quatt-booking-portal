import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { $api } from "@/openapi-client/context";
import type { components } from "@/openapi-client/types/api/v1";

type Installer = components["schemas"]["Installer"];

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  installerId?: string;
  installerData?: Installer;
  onSuccess: () => void;
}

const codeRegex = /^\w{4}-\w{4}$/;
const phoneRegex = /^\+.*/;

function generateInstallerCode() {
  return (
    btoa(Math.random().toString()).substring(10, 14).toUpperCase() +
    "-" +
    btoa(Math.random().toString()).substring(10, 14).toUpperCase()
  );
}

const installerFormSchema = z.object({
  code: z
    .string()
    .min(1, "This field is required")
    .regex(codeRegex, "Code must be XXXX-XXXX format"),
  name: z.string().min(1, "This field is required"),
  phone: z
    .string()
    .min(1, "This field is required")
    .regex(phoneRegex, "Phone must start with +"),
  isActive: z.boolean(),
});

type InstallerFormData = z.infer<typeof installerFormSchema>;

export function InstallerModal({
  isOpen,
  closeModal,
  installerId,
  installerData,
  onSuccess,
}: Props) {
  const defaultValues = React.useMemo(() => {
    return {
      code: installerData?.code ?? generateInstallerCode(),
      name: installerData?.name ?? "",
      phone: installerData?.phone ?? "",
      isActive: installerData?.isActive ?? false,
    };
  }, [installerData]);

  const form = useForm<InstallerFormData>({
    resolver: zodResolver(installerFormSchema),
    defaultValues,
  });

  React.useEffect(() => {
    form.reset(defaultValues);

    return () => {
      form.reset();
    };
  }, [form, defaultValues]);

  const createInstallerMutation = $api.useMutation("post", "/admin/installer", {
    onSuccess: () => {
      toast.success("Installer created successfully");
      form.reset();
      closeModal();
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to create installer");
    },
  });

  const updateInstallerMutation = $api.useMutation(
    "put",
    "/admin/installer/{installerId}",
    {
      onSuccess: () => {
        toast.success("Installer updated successfully");
        form.reset();
        closeModal();
        onSuccess();
      },
      onError: () => {
        toast.error("Failed to update installer");
      },
    },
  );

  const isSubmitting =
    createInstallerMutation.isPending || updateInstallerMutation.isPending;

  const onSubmit = (data: InstallerFormData) => {
    if (installerId) {
      updateInstallerMutation.mutate({
        params: {
          path: { installerId },
        },
        body: data,
      });
    } else {
      createInstallerMutation.mutate({
        body: data,
      });
    }
  };

  const handleClose = () => {
    form.reset();
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px] border border-gray-200 shadow-xl dark:border-gray-700">
        <DialogHeader>
          <DialogTitle>
            {installerId ? "Edit Installer" : "Create Installer"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Is Active</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "true")}
                    value={field.value ? "true" : "false"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!form.formState.isDirty || isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export type OpenInstallerModal = (args?: {
  installerId?: string;
  data?: Installer;
}) => void;

export const useInstallerModalState = (defaultState?: boolean) => {
  const [installerId, setInstallerId] = React.useState<string | undefined>();
  const [data, setData] = React.useState<Installer | undefined>();
  const [isOpen, setIsOpen] = React.useState(() => {
    return defaultState ?? false;
  });

  const toggleIsOpen = React.useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  const open = React.useCallback<OpenInstallerModal>(
    ({ installerId, data } = {}) => {
      setIsOpen(true);
      setInstallerId(installerId);
      setData(data);
    },
    [],
  );

  const close = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, toggleIsOpen, open, close, installerId, data };
};
