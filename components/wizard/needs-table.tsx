"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";

export interface Need {
  __id: string;
  type: string;
  label: string;
  amounts: { [childId: string]: number };
}

export interface NeedsTableProps {
  children: Array<{ __id: string; firstName?: string }>;
  value: Need[];
  onChange: (needs: Need[]) => void;
  className?: string;
}

const DEFAULT_NEED_TYPES = [
  { label: "מזון", type: "food" },
  { label: "ביגוד והנעלה", type: "clothing" },
  { label: "חינוך", type: "education" },
  { label: "בריאות", type: "health" },
  { label: "פנאי וחוגים", type: "leisure" },
  { label: "דיור", type: "housing" },
  { label: "תחבורה", type: "transport" },
];

/**
 * Dynamic needs table for child support calculations
 * Columns adjust based on number of children
 */
export function NeedsTable({
  children,
  value = [],
  onChange,
  className,
}: NeedsTableProps) {
  // Initialize with default needs if empty
  React.useEffect(() => {
    if (value.length === 0) {
      const defaultNeeds: Need[] = DEFAULT_NEED_TYPES.map((needType) => ({
        __id: crypto.randomUUID(),
        type: needType.type,
        label: needType.label,
        amounts: {},
      }));
      onChange(defaultNeeds);
    }
  }, []);

  // When children change, ensure all needs have entries for all children
  React.useEffect(() => {
    if (value.length > 0 && children.length > 0) {
      const updatedNeeds = value.map((need) => {
        const updatedAmounts = { ...need.amounts };
        children.forEach((child) => {
          if (!(child.__id in updatedAmounts)) {
            updatedAmounts[child.__id] = 0;
          }
        });
        return { ...need, amounts: updatedAmounts };
      });
      onChange(updatedNeeds);
    }
  }, [children.length]);

  const handleAmountChange = (
    needId: string,
    childId: string,
    inputValue: string
  ) => {
    const numValue = parseFloat(inputValue) || 0;
    onChange(
      value.map((need) =>
        need.__id === needId
          ? {
              ...need,
              amounts: { ...need.amounts, [childId]: numValue },
            }
          : need
      )
    );
  };

  const handleAddNeed = () => {
    const amounts: { [key: string]: number } = {};
    children.forEach((child) => {
      amounts[child.__id] = 0;
    });

    onChange([
      ...value,
      {
        __id: crypto.randomUUID(),
        type: "custom",
        label: "",
        amounts,
      },
    ]);
  };

  const handleRemoveNeed = (needId: string) => {
    onChange(value.filter((need) => need.__id !== needId));
  };

  const handleLabelChange = (needId: string, newLabel: string) => {
    onChange(
      value.map((need) =>
        need.__id === needId ? { ...need, label: newLabel } : need
      )
    );
  };

  // Calculate totals per child
  const totals = React.useMemo(() => {
    const childTotals: { [childId: string]: number } = {};
    children.forEach((child) => {
      childTotals[child.__id] = value.reduce(
        (sum, need) => sum + (need.amounts[child.__id] || 0),
        0
      );
    });
    return childTotals;
  }, [value, children]);

  if (children.length === 0) {
    return (
      <div className="text-center py-8 bg-neutral-lightest rounded-lg border border-neutral">
        <p className="text-body text-neutral-dark mb-2">
          לא הוגדרו ילדים עדיין
        </p>
        <p className="text-body-small text-neutral-dark">
          הוסיפו ילדים כדי להשתמש בטבלת הצרכים
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-neutral-light">
              <th className="px-4 py-3 text-right text-body-small font-semibold text-neutral-darkest border-b border-neutral">
                סוג צורך
              </th>
              {children.map((child, index) => (
                <th
                  key={child.__id}
                  className="px-4 py-3 text-center text-body-small font-semibold text-neutral-darkest border-b border-neutral min-w-[140px]"
                >
                  {child.firstName || `ילד/ה ${index + 1}`}
                </th>
              ))}
              <th className="px-4 py-3 w-12 border-b border-neutral"></th>
            </tr>
          </thead>
          <tbody>
            {value.map((need) => (
              <tr key={need.__id} className="border-b border-neutral-light">
                <td className="px-4 py-3">
                  {need.type === "custom" ? (
                    <input
                      type="text"
                      value={need.label}
                      onChange={(e) =>
                        handleLabelChange(need.__id, e.target.value)
                      }
                      placeholder="שם הצורך..."
                      className="w-full px-2 py-1 border border-neutral rounded text-body"
                    />
                  ) : (
                    <span className="text-body font-medium text-neutral-darkest">
                      {need.label}
                    </span>
                  )}
                </td>
                {children.map((child) => (
                  <td key={child.__id} className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={need.amounts[child.__id] || 0}
                      onChange={(e) =>
                        handleAmountChange(need.__id, child.__id, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-neutral rounded text-center text-body dir-rtl"
                      min="0"
                      step="1"
                    />
                  </td>
                ))}
                <td className="px-2 py-3 text-center">
                  {need.type === "custom" && (
                    <button
                      type="button"
                      onClick={() => handleRemoveNeed(need.__id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      aria-label="הסר צורך"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-primary/5 font-semibold">
              <td className="px-4 py-3 text-right text-body font-bold text-neutral-darkest">
                סה"כ לחודש
              </td>
              {children.map((child) => (
                <td
                  key={child.__id}
                  className="px-4 py-3 text-center text-body font-bold text-primary"
                >
                  {formatCurrency(totals[child.__id] || 0)}
                </td>
              ))}
              <td className="px-2 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Add custom need button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddNeed}
        className="w-full"
      >
        <Plus className="w-4 h-4 ml-1" />
        הוסף צורך נוסף
      </Button>

      {/* Mobile scroll hint */}
      <p className="text-caption text-neutral-dark text-center lg:hidden">
        גררו ימינה/שמאלה לצפייה בכל העמודות
      </p>
    </div>
  );
}
