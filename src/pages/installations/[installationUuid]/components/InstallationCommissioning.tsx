import { useMemo, useState } from "react";
import type { components } from "@/openapi-client/types/api/v1";
import { $api } from "@/openapi-client/context";
import { ErrorText } from "@/components/shared/ErrorText";
import { CardContainer } from "@/components/shared/DetailPage";
import { formatDateTime } from "@/utils/formatDate";
import { formatDistance, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { toast } from "sonner";

type BaseCommissioningTest = components["schemas"]["BaseCommissioningTest"];
type CommissioningStatus = components["schemas"]["BaseCommissioning"]["status"];
type TestStatus = components["schemas"]["BaseCommissioningTest"]["status"];

export interface InstallationCommissioningProps {
  installationId: string;
}

const runningTestStatuses: TestStatus[] = [
  "WAITING_PREREQUISITE",
  "IN_PROGRESS",
  "VALIDATED",
];

function toCommissioningStatusText(status: CommissioningStatus): string {
  const statusMap: Record<CommissioningStatus, string> = {
    SUCCESS: "Commissioning was successful",
    FAILED: "Commissioning has failed (timeout)",
    IN_PROGRESS: "Tests in progress",
    READY: "Tests are ready to be run (identification and configuration done)",
    WAITING_PREREQUISITE: "Waiting for prerequisites (e.g. CIC not up to date)",
    DEVICES_IDENTIFICATION: "Devices identification in progress",
    CANCELLED: "Commissioning was cancelled",
  };
  return statusMap[status] || "Unknown status";
}

function toTestStatusText(
  status: TestStatus,
  isInPostTreatment?: boolean,
): string {
  if (isInPostTreatment) return "Test in post-treatment phase";

  const statusMap: Record<TestStatus, string> = {
    SUCCESS: "Test successful",
    FAILED: "Test failed",
    IN_PROGRESS: "Test in progress",
    READY: "Test is ready to be started by installer",
    WAITING: "Test waiting (cannot be started by installer)",
    CANCELLED: "Test was cancelled",
    VALIDATED: "Test was validated by cloud (waiting for installer validation)",
    WAITING_PREREQUISITE:
      "Test is started by waiting for prerequisites (eg. pre-pump) to run validation",
  };
  return statusMap[status] || "Unknown status";
}

function getRunningTest(
  tests: BaseCommissioningTest[],
): BaseCommissioningTest | null {
  if (!tests || tests.length === 0) return null;
  return (
    tests.find(
      (test) =>
        runningTestStatuses.includes(test.status) || test.isInPostTreatment,
    ) || null
  );
}

function isCommissioningUnfinished(status: CommissioningStatus): boolean {
  return [
    "IN_PROGRESS",
    "READY",
    "WAITING_PREREQUISITE",
    "DEVICES_IDENTIFICATION",
  ].includes(status);
}

function isTestUnfinished(status: TestStatus): boolean {
  return [
    "IN_PROGRESS",
    "READY",
    "WAITING_PREREQUISITE",
    "WAITING",
    "VALIDATED",
  ].includes(status);
}

function getTestPhase(test: BaseCommissioningTest): string {
  if (!isTestUnfinished(test.status)) return "Unknown phase";
  if (test.status === "READY") return "Ready to be started";
  if (test.isInPostTreatment) return "Post-treatment";
  if (test.prerequisiteStartedAt && !test.startedAt) return "Pre-requisite";
  if (test.startedAt && !test.endedAt) return "Test validation in progress";
  return "Unknown phase";
}

/**
 * Installation Commissioning Component
 * Displays latest non-hybrid commissioning status with real-time updates
 */
export function InstallationCommissioning({
  installationId,
}: InstallationCommissioningProps) {
  const {
    data: commissioningData,
    error,
    isPending,
    refetch,
  } = $api.useQuery(
    "get",
    "/admin/installation/{installationId}/commissioning/latest",
    {
      params: {
        path: { installationId },
      },
    },
    {
      refetchInterval: (query) => {
        // Refetch every 2 seconds only if commissioning is unfinished
        if (query.state.status === "success" && query.state.data?.result) {
          return isCommissioningUnfinished(query.state.data.result.status)
            ? 2000
            : false;
        }
        return query.state.status === "error" ? false : 2000;
      },
    },
  );

  // Mutations for admin actions
  const forceCommissioningMutation = $api.useMutation(
    "patch",
    "/admin/installation/{installationId}/commissioning/latest",
    {
      onSuccess: () => {
        toast.success("Commissioning forced to SUCCESS");
        refetch();
      },
      onError: () => {
        toast.error("Failed to force commissioning to SUCCESS");
      },
    },
  );

  const updateTestMutation = $api.useMutation(
    "patch",
    "/installer/commissioningTest/{commissioningTestUuid}",
    {
      onSuccess: () => {
        toast.success("Test updated successfully");
        refetch();
      },
      onError: () => {
        toast.error("Failed to update test");
      },
    },
  );

  // State for test selection
  const [selectedTestUuid, setSelectedTestUuid] = useState("");

  // Handler functions
  const handleForceCommissioningSuccess = () => {
    if (
      !window.confirm(
        "Are you sure you want to force this commissioning to SUCCESS?",
      )
    ) {
      return;
    }
    forceCommissioningMutation.mutate({
      params: { path: { installationId } },
      body: { status: "SUCCESS", forced: true },
    });
  };

  const handleForceTestSuccess = (testUuid: string) => {
    if (
      !window.confirm("Are you sure you want to force this test to SUCCESS?")
    ) {
      return;
    }
    updateTestMutation.mutate({
      params: { path: { commissioningTestUuid: testUuid } },
      body: { status: "SUCCESS", forced: true },
    });
  };

  const handleStartTest = (testUuid: string) => {
    updateTestMutation.mutate({
      params: { path: { commissioningTestUuid: testUuid } },
      body: { status: "IN_PROGRESS" },
    });
  };

  const readyTests = useMemo(() => {
    return commissioningData?.result?.tests
      ? commissioningData.result.tests
          .filter((test) => test.status === "READY")
          .sort((a, b) => a.step - b.step)
      : [];
  }, [commissioningData]);

  const runningTest = useMemo(() => {
    return commissioningData?.result?.tests
      ? getRunningTest(commissioningData.result.tests)
      : null;
  }, [commissioningData]);

  if (isPending) {
    return (
      <CardContainer title="Latest Non-Hybrid Commissioning">
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          Loading commissioning data...
        </div>
      </CardContainer>
    );
  }

  if (error) {
    const isNotFound =
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "status" in error.response &&
      error.response.status === 404;

    return (
      <CardContainer title="Latest Non-Hybrid Commissioning">
        <ErrorText
          text={
            isNotFound
              ? "No commissioning found"
              : `Failed to fetch latest commissioning for installation ${installationId}.`
          }
          retry={!isNotFound ? () => refetch() : undefined}
        />
      </CardContainer>
    );
  }

  const commissioning = commissioningData?.result;
  if (!commissioning) return null;

  return (
    <CardContainer title="Latest Non-Hybrid Commissioning">
      <div className="space-y-4">
        {/* Status */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Status
          </h4>
          <p className="text-gray-900 dark:text-gray-100">
            {toCommissioningStatusText(commissioning.status)}
          </p>
        </div>

        {/* Created At */}
        {isCommissioningUnfinished(commissioning.status) && (
          <>
            <div>
              <h4 className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Created At
              </h4>
              <p className="text-gray-900 dark:text-gray-100">
                {formatDateTime(new Date(commissioning.createdAt))}
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleForceCommissioningSuccess}
              disabled={forceCommissioningMutation.isPending}
              className="w-full"
            >
              {forceCommissioningMutation.isPending
                ? "Forcing..."
                : "Force Commissioning to SUCCESS"}
            </Button>
          </>
        )}

        {/* Ended At */}
        {commissioning.endedAt && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Ended At
            </h4>
            <p className="text-gray-900 dark:text-gray-100">
              {formatDateTime(new Date(commissioning.endedAt))}
            </p>
          </div>
        )}

        {/* Was Forced */}
        {commissioning.status === "SUCCESS" && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Was Forced
            </h4>
            <p className="text-gray-900 dark:text-gray-100">
              {commissioning.forced ? "Yes" : "No"}
            </p>
          </div>
        )}

        {/* Running Test or Test Selector */}
        {commissioning.status === "IN_PROGRESS" && (
          <>
            {runningTest && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-dark-foreground">
                <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300 break-all">
                  Current Test: {runningTest.type}
                </h4>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Status:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 text-wrap white">
                      {toTestStatusText(
                        runningTest.status,
                        runningTest.isInPostTreatment,
                      )}
                    </span>
                  </div>

                  {isTestUnfinished(runningTest.status) && (
                    <>
                      {(runningTest.prerequisiteStartedAt ||
                        runningTest.startedAt) && (
                        <>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Phase:{" "}
                            </span>
                            <span className="text-gray-900 dark:text-gray-100">
                              {getTestPhase(runningTest)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Total Duration:{" "}
                            </span>
                            <span className="text-gray-900 dark:text-gray-100">
                              {formatDistanceToNow(
                                new Date(
                                  (runningTest.prerequisiteStartedAt ||
                                    runningTest.startedAt)!,
                                ),
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Started At:{" "}
                            </span>
                            <span className="text-gray-900 dark:text-gray-100">
                              {formatDateTime(
                                new Date(
                                  (runningTest.prerequisiteStartedAt ||
                                    runningTest.startedAt)!,
                                ),
                              )}
                            </span>
                          </div>
                        </>
                      )}
                      {runningTest.prerequisiteStartedAt && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Duration of Pre-requisites:{" "}
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {formatDistance(
                              new Date(runningTest.prerequisiteStartedAt),
                              new Date(runningTest.startedAt || new Date()),
                            )}
                          </span>
                        </div>
                      )}
                      {runningTest.startedAt && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Duration of Validation:{" "}
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {formatDistance(
                              new Date(runningTest.startedAt),
                              new Date(
                                runningTest.postTreatmentStartedAt ||
                                  new Date(),
                              ),
                            )}
                          </span>
                        </div>
                      )}
                      {runningTest.postTreatmentStartedAt && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Duration of Post-Treatments:{" "}
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {formatDistance(
                              new Date(runningTest.postTreatmentStartedAt),
                              new Date(
                                runningTest.postTreatmentEndedAt || new Date(),
                              ),
                            )}
                          </span>
                        </div>
                      )}
                      <div className="mt-3">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() =>
                            handleForceTestSuccess(runningTest.uuid)
                          }
                          disabled={updateTestMutation.isPending}
                        >
                          {updateTestMutation.isPending
                            ? "Forcing..."
                            : "Force Test SUCCESS"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {!runningTest && readyTests.length === 1 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-dark-foreground">
                <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Ready Test: {readyTests[0].type}
                </h4>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  {toTestStatusText(readyTests[0].status)}
                </p>
                <Button
                  size="sm"
                  onClick={() => handleStartTest(readyTests[0].uuid)}
                  disabled={updateTestMutation.isPending}
                >
                  {updateTestMutation.isPending ? "Starting..." : "Start Test"}
                </Button>
              </div>
            )}

            {!runningTest && readyTests.length > 1 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-dark-foreground">
                <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  No Test is Started
                </h4>
                <div className="space-y-3">
                  <Select
                    value={selectedTestUuid}
                    onValueChange={setSelectedTestUuid}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-900">
                      <SelectValue placeholder="Select a test to start" />
                    </SelectTrigger>
                    <SelectContent>
                      {readyTests.map((test) => (
                        <SelectItem key={test.uuid} value={test.uuid}>
                          {test.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={() => handleStartTest(selectedTestUuid)}
                    disabled={!selectedTestUuid || updateTestMutation.isPending}
                  >
                    {updateTestMutation.isPending
                      ? "Starting..."
                      : "Start Selected Test"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </CardContainer>
  );
}
