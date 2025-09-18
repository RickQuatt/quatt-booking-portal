import { useReducer } from "react";
import { AdminCic } from "../api-client/models";
import { useApiClient } from "../api-client/context";
import { useQueryClient } from "@tanstack/react-query";
import {
  FormField,
  FormFieldTitle,
  FormFieldValue,
  FormSection,
} from "../ui-components/form/Form";
import { Button } from "../ui-components/button/Button";
import ErrorText from "../ui-components/error-text/ErrorText";
import SuccessText from "../ui-components/success-text/SuccessText";
import classes from "./CICDetail.module.css";
import { DetailSectionHeader } from "./CICDetailSectionHeader";

export type AdminCicWithAvoidNighttimeCharging = AdminCic & {
  avoidNighttimeCharging: NonNullable<AdminCic["avoidNighttimeCharging"]>;
};

interface UpdateState {
  status: "idle" | "loading" | "success" | "error";
  message: string | null;
}

type UpdateAction =
  | { type: "START_UPDATE" }
  | { type: "UPDATE_SUCCESS"; message: string }
  | { type: "UPDATE_ERROR"; message: string }
  | { type: "CLEAR_MESSAGE" };

const updateReducer = (
  state: UpdateState,
  action: UpdateAction,
): UpdateState => {
  switch (action.type) {
    case "START_UPDATE":
      return { status: "loading", message: null };
    case "UPDATE_SUCCESS":
      return { status: "success", message: action.message };
    case "UPDATE_ERROR":
      return { status: "error", message: action.message };
    case "CLEAR_MESSAGE":
      return { status: "idle", message: null };
    default:
      return state;
  }
};

export function CICDetailAvoidNighttimeCharging({
  cicData,
}: {
  cicData: AdminCicWithAvoidNighttimeCharging;
}) {
  const { avoidNighttimeCharging } = cicData;
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  const [updateState, dispatch] = useReducer(updateReducer, {
    status: "idle",
    message: null,
  });

  const handleToggleAvoidNighttimeCharging = async (newValue: boolean) => {
    dispatch({ type: "START_UPDATE" });

    try {
      const response = await apiClient.adminUpdateCic({
        cicId: cicData.id,
        updateAdminCic: {
          avoidNighttimeCharging: {
            allEAvoidNighttimeCharging: newValue,
          },
        },
      });

      if (response.meta.status === 200) {
        queryClient.invalidateQueries({ queryKey: ["cicDetail", cicData.id] });
        dispatch({
          type: "UPDATE_SUCCESS",
          message: `Successfully ${newValue ? "enabled" : "disabled"} avoid nighttime charging`,
        });
      } else {
        dispatch({
          type: "UPDATE_ERROR",
          message: "Failed to update avoid nighttime charging setting",
        });
      }
    } catch (error) {
      console.error("Error updating avoid nighttime charging:", error);
      dispatch({
        type: "UPDATE_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  return (
    <div className={classes["detail-section"]}>
      <DetailSectionHeader title="Avoid Nighttime Charging" />
      <FormSection>
        <FormField>
          <FormFieldTitle>Status</FormFieldTitle>
          <FormFieldValue
            value={
              avoidNighttimeCharging.allEAvoidNighttimeCharging
                ? "Enabled"
                : "Disabled"
            }
          />
        </FormField>

        <FormField>
          <FormFieldTitle>Nighttime Window</FormFieldTitle>
          <FormFieldValue
            value={`${avoidNighttimeCharging.nighttimeChargingStartTime} - ${avoidNighttimeCharging.nighttimeChargingEndTime}`}
          />
        </FormField>

        <div className={classes["form-actions"]}>
          <Button
            onClick={() =>
              handleToggleAvoidNighttimeCharging(
                !avoidNighttimeCharging.allEAvoidNighttimeCharging,
              )
            }
            disabled={updateState.status === "loading"}
            color={
              avoidNighttimeCharging.allEAvoidNighttimeCharging
                ? "danger"
                : undefined
            }
          >
            {updateState.status === "loading"
              ? "Updating..."
              : avoidNighttimeCharging.allEAvoidNighttimeCharging
                ? "Disable Avoid Nighttime Charging"
                : "Enable Avoid Nighttime Charging"}
          </Button>
        </div>

        {updateState.status === "error" && updateState.message && (
          <ErrorText text={updateState.message} />
        )}
        {updateState.status === "success" && updateState.message && (
          <SuccessText
            text={updateState.message}
            onDismiss={() => dispatch({ type: "CLEAR_MESSAGE" })}
          />
        )}
      </FormSection>
    </div>
  );
}
