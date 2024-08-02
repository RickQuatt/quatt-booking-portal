import { AdminInstallationDetail } from "../api-client/models";
import {
  FormField,
  FormFieldTitle,
  FormFieldValue,
  FormSection,
} from "../ui-components/form/Form";
import classes from "./InstallationDetail.module.css";
import QRCode from "react-qr-code";
import { DetailSectionHeader } from "../cic-detail/CICDetailSectionHeader";
import { formatDateDistance, formatDateTimeString } from "../utils/formatDate";

export function InstallationDetailCICQR({
  installation,
}: {
  installation: AdminInstallationDetail;
}) {
  return (
    <div className={classes["detail-section"]}>
      <DetailSectionHeader title="📷 CIC QR" />
      <FormSection>
        <FormField>
          <FormFieldTitle>Active CIC</FormFieldTitle>
          <FormFieldValue value={installation.activeCic} />
        </FormField>
        <QRCode
          size={156}
          style={{
            height: "auto",
            maxWidth: "80%",
            width: "80%",
            margin: "0 auto",
          }}
          value={"https://app.quatt.io/cic/" + installation.activeCic}
          viewBox={`0 0 256 256`}
        />
      </FormSection>
    </div>
  );
}
