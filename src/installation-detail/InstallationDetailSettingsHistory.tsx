import React from "react";

import classes from "./InstallationDetail.module.css";
import { AdminInstallationDetail } from "../api-client/models";
import { FormField, FormSection } from "../ui-components/form/Form";
import { Accordion, AccordionItem } from "../ui-components/accordion/Accordion";
import { formatDateTime } from "../utils/formatDate";
import { DetailSectionHeader } from "../cic-detail/CICDetailSectionHeader";
import { useApiClient } from "../api-client/context";
import { useQuery } from "@tanstack/react-query";

interface InstallationDetailProps {
  installation: AdminInstallationDetail;
}

export function InstallationDetailSettingsHistory({
  installation,
}: InstallationDetailProps) {
  return (
    <div className={classes["detail-section"]}>
      <DetailSectionHeader title="👀 Settings history" />
      <FormSection>
        <FormField>
          <div className={classes["detail-section-commissioning"]}>
            <Accordion>
              {installation.settingsUpdates.map((setting, index) => (
                <InstallationDetailSettingsItem
                  key={index}
                  installationId={installation.externalId}
                  settingsId={setting.settingsId}
                  createdAt={setting.createdAt}
                  updatedBy={setting.updatedBy}
                  isUnconfirmed={setting.isUnconfirmed}
                />
              ))}
            </Accordion>
          </div>
          {installation.settingsUpdates.length === 0 && (
            <div style={{ textAlign: "center" }}>No settings updates 👍</div>
          )}
        </FormField>
      </FormSection>
    </div>
  );
}

interface InstallationDetailSettingsItemProps {
  createdAt: Date;
  updatedBy: string | null;
  isUnconfirmed: boolean;
  installationId: string | null;
  settingsId: string | null;
}

function InstallationDetailSettingsItem({
  createdAt,
  updatedBy,
  isUnconfirmed,
  installationId,
  settingsId,
}: InstallationDetailSettingsItemProps) {
  const apiClient = useApiClient();
  const [isOpen, setIsOpen] = React.useState(false);
  const { data, isPending } = useQuery({
    queryKey: ["installationSettings", installationId, settingsId],
    queryFn: () =>
      apiClient.adminGetInstallationSetting({
        installationId: installationId || "",
        settingsId: settingsId || "",
      }),
    enabled: isOpen && !!installationId && !!settingsId,
  });

  const dataJson = data?.result ?? [];
  const settingsString = data?.result?.settings.toString();
  const settings = JSON.parse(settingsString || "{}");

  const excludedKeys = ["settings"];
  const datesKeys = ["createdAt", "updatedAt", "confirmedAt", "cancelledAt"];
  const listOfSettings = [
    ...Object.entries(dataJson)
      .filter(([key]) => !excludedKeys.includes(key))
      .map(([key, value]) => [
        key,
        datesKeys.includes(key) ? formatDateTime(value) : String(value),
      ]),
  ];

  const settingsColumn = [
    ...Object.entries(settings).filter(([key]) => key !== "settingsId"),
  ];

  const toggleOpen = () => {
    setIsOpen((prevValue) => !prevValue);
  };

  return (
    <AccordionItem
      title={formatDateTime(createdAt) || "No date"}
      additionalInfo={
        <>
          <div>Updated by: {updatedBy ?? "-"}</div>
          <div>Is Confirmed: {isUnconfirmed ? "❌" : "✅"}</div>
        </>
      }
      isOpen={isOpen}
      onChangeIsOpen={toggleOpen}
    >
      {isPending ? (
        <div>is Loading....</div>
      ) : (
        <div>
          <div className={classes["settings-history-card"]}>
            <ul className={classes["settings-history-bullet"]}>
              {listOfSettings.map(([key, value]) => (
                <li key={key}>
                  <>
                    <b>{key}:</b> {value}
                  </>
                </li>
              ))}
              <li>
                <b>settings:</b>
              </li>
              {settingsColumn.map(([key, value]) => (
                <li
                  className={classes["settings-history-child-setting"]}
                  key={key}
                >
                  <>
                    <b>{key}:</b> {value}
                  </>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </AccordionItem>
  );
}
