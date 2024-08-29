import React from "react";
import DetailBlock, {
  UnitSuffix,
  TextColor,
} from "../detail-block/DetailBlock";

interface ThresholdCheckProps {
  title: string;
  value?: string | number | null;
  unitSuffix?: UnitSuffix;
  lowerThreshold?: number;
  lowerThresholdMessage?: string;
  upperThreshold?: number;
  upperThresholdMessage?: string;
}

function ThresholdCheck({
  title,
  value,
  unitSuffix = UnitSuffix.NONE,
  lowerThreshold,
  lowerThresholdMessage,
  upperThreshold,
  upperThresholdMessage,
}: ThresholdCheckProps) {
  const lowerThresholdPassed =
    lowerThreshold && typeof value === "number" && value < lowerThreshold;
  const upperThresholdPassed =
    upperThreshold && typeof value === "number" && value > upperThreshold;
  const thresholdPassed = lowerThresholdPassed || upperThresholdPassed;
  const warningMessage = lowerThresholdMessage || upperThresholdMessage;
  const valueColor = thresholdPassed ? TextColor.RED : TextColor.BLACK;

  return (
    <DetailBlock
      title={title}
      value={value}
      unitSuffix={unitSuffix}
      valueColor={valueColor}
    >
      {thresholdPassed && (
        <span style={{ color: TextColor.RED }}>{warningMessage}</span>
      )}
    </DetailBlock>
  );
}

export default ThresholdCheck;
