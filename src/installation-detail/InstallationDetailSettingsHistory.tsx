import React from "react";

import classes from "./InstallationDetail.module.css";
import {
  AdminInstallationDetail,
  CicSettingsUpdate,
} from "../api-client/models";
import { FormField, FormSection } from "../ui-components/form/Form";
import { Accordion, AccordionItem } from "../ui-components/accordion/Accordion";
import { formatDateTime } from "../utils/formatDate";
import { DetailSectionHeader } from "../cic-detail/CICDetailSectionHeader";

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
                  settingsUpdate={setting}
                  key={index}
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
  settingsUpdate: CicSettingsUpdate;
}

function InstallationDetailSettingsItem({
  settingsUpdate,
}: InstallationDetailSettingsItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const settings = settingsUpdate.settings.toString();
  const settinsJson = JSON.parse(settings);

  const excludedKeys = ["settings"];
  const datesKeys = ["createdAt", "updatedAt", "confirmedAt", "cancelledAt"];
  const listOfSettings = [
    ...Object.entries(settingsUpdate)
      .filter(([key]) => !excludedKeys.includes(key))
      .map(([key, value]) => [
        key,
        datesKeys.includes(key) ? formatDateTime(value) : value,
      ]),
  ];

  const settingsColumn = [
    ...Object.entries(settinsJson).filter(([key]) => key !== "settingsId"),
  ];

  return (
    <AccordionItem
      title={formatDateTime(settingsUpdate.createdAt) || "No date"}
      additionalInfo={
        <>
          <div>Updated by: {settingsUpdate.updatedBy ?? "-"}</div>
          <div>Is Confirmed: {settingsUpdate.isUnconfirmed ? "❌" : "✅"}</div>
        </>
      }
      isOpen={isOpen}
      onChangeIsOpen={() => setIsOpen(!isOpen)}
    >
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
    </AccordionItem>
  );
}
