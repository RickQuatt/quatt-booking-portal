import { AdminCic } from "../api-client/models";
import {
  FormField,
  FormFieldJson,
  FormFieldTitle,
  FormSection,
} from "../ui-components/form/Form";
import classes from "./CICDetail.module.css";
import { CICDetailSectionHeader } from "./CICDetailSectionHeader";
import { Accordion, AccordionItem } from "../ui-components/accordion/Accordion";
import { useState } from "react";
import { formatDateTime } from "../utils/formatDate";

export function CICDetailCommissioning({ cicData }: { cicData: AdminCic }) {
  const [isOpen, setIsOpen] = useState(false);
  // console.log(cicData.commissioningHistory[0]);

  return (
    <div className={classes["detail-section"]}>
      <CICDetailSectionHeader title="Commissioning  details" />
      <FormSection>
        <FormField>
          <FormFieldTitle>Date of commissionings</FormFieldTitle>
          <Accordion>
            {cicData.commissioningHistory.map((commissioning) => (
              <AccordionItem
                title={formatDateTime(commissioning.createdAt) || "No date"}
                isOpen={isOpen}
                onChangeIsOpen={() => setIsOpen(!isOpen)}
              >
                <FormFieldJson value={commissioning} />
              </AccordionItem>
            ))}
          </Accordion>
        </FormField>
      </FormSection>
    </div>
  );
}
