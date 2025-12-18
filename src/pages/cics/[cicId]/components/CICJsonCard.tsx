import { ThemedJsonView } from "@/components/shared/ThemedJsonView";
import type { components } from "@/openapi-client/types/api/v1";
import { CardContainer } from "@/components/shared/DetailPage";

type AdminCic = components["schemas"]["AdminCic"];

export interface CICJsonCardProps {
  cicData: AdminCic;
}

/**
 * Bottom card displaying complete CIC JSON data
 * Uses react-json-view for interactive JSON exploration
 */
export function CICJsonCard({ cicData }: CICJsonCardProps) {
  return (
    <CardContainer title="Complete JSON Data">
      <div className="rounded-md border-2 border-border bg-gray-50 p-4 dark:bg-dark-foreground overflow-x-auto max-w-full">
        <ThemedJsonView
          value={cicData}
          collapsed={2}
          displayDataTypes={true}
          displayObjectSize={true}
          enableClipboard={true}
          style={{
            fontSize: "13px",
            lineHeight: "1.5",
            fontFamily:
              '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
          }}
        />
      </div>
    </CardContainer>
  );
}
