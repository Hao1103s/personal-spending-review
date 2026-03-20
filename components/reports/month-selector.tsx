import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatMonthLabel } from "@/lib/utils";

export function MonthSelector({
  availableMonths,
  currentMonth,
}: {
  availableMonths: string[];
  currentMonth: string;
}) {
  return (
    <form className="flex flex-col gap-3 md:flex-row md:items-center">
      <Select name="month" defaultValue={currentMonth} className="min-w-48">
        {availableMonths.map((month) => (
          <option key={month} value={month}>
            {formatMonthLabel(`${month}-01`)}
          </option>
        ))}
      </Select>
      <Button type="submit">切换月份</Button>
    </form>
  );
}
