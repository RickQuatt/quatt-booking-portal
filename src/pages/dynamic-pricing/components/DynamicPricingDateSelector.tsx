import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface DynamicPricingDateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DynamicPricingDateSelector({
  selectedDate,
  onDateChange,
}: DynamicPricingDateSelectorProps) {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value;
    if (dateValue) {
      onDateChange(new Date(dateValue + "T00:00:00.000Z"));
    }
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const maxDate = formatDateForInput(new Date());

  const handlePreviousDay = () => {
    const previousDay = new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000);
    onDateChange(previousDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000);
    onDateChange(nextDay);
  };

  const handleTodayClick = () => {
    onDateChange(new Date());
  };

  const today = new Date();
  const isToday =
    formatDateForInput(selectedDate) === formatDateForInput(today);

  return (
    <div className="space-y-2">
      <Label htmlFor="date-selector">Select Date</Label>
      <div className="flex items-center gap-2">
        <Button
          onClick={handlePreviousDay}
          variant="outline"
          size="icon"
          title="Previous day"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Input
          id="date-selector"
          type="date"
          value={formatDateForInput(selectedDate)}
          onChange={handleDateChange}
          max={maxDate}
          className="h-9 w-auto rounded-full"
        />

        <Button
          onClick={handleTodayClick}
          disabled={isToday}
          variant="outline"
          size="sm"
          title="Go to today"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Today
        </Button>

        <Button
          onClick={handleNextDay}
          disabled={isToday}
          variant="outline"
          size="icon"
          title="Next day"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
