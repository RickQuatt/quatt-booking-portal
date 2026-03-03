import { toast } from "sonner";
import { $api } from "@/openapi-client/context";
import type { components } from "@/openapi-client/types/api/v1";

type ReplaceChillInterfaceBoardResponse =
  components["schemas"]["ReplaceChillInterfaceBoardResponse"];

interface UseReplaceChillInterfaceBoardOptions {
  onSuccess?: (result: ReplaceChillInterfaceBoardResponse) => void;
}

export function useReplaceChillInterfaceBoard({
  onSuccess,
}: UseReplaceChillInterfaceBoardOptions = {}) {
  const mutation = $api.useMutation(
    "post",
    "/admin/device/{deviceUuid}/replace-chill-interface-board",
    {
      onSuccess: (response) => {
        toast.success("Chill interface board replaced successfully");
        onSuccess?.(response.result);
      },
      onError: (error) => {
        const errorResponse = error as {
          result?: { errorCode?: string; message?: string };
        };
        const errorCode = errorResponse?.result?.errorCode;
        const errorMessage = errorResponse?.result?.message;

        if (errorMessage) {
          toast.error(errorMessage);
        } else {
          switch (errorCode) {
            case "DEVICE_NOT_FOUND":
              toast.error("Device not found");
              break;
            case "BOARD_NOT_FOUND":
              toast.error("Interface board not found in inventory");
              break;
            default:
              toast.error("Failed to replace chill interface board");
          }
        }
        console.error("Replace chill interface board error:", error);
      },
    },
  );

  const replaceBoard = (deviceUuid: string, newBoardSerialNumber: string) => {
    mutation.mutate({
      params: {
        path: { deviceUuid },
      },
      body: { newBoardSerialNumber },
    });
  };

  return {
    replaceBoard,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    data: mutation.data?.result,
    reset: mutation.reset,
  };
}
