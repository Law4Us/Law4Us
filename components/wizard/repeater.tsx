"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface RepeaterField {
  id: string;
  name: string;
  label: string;
  type: "text" | "number" | "date" | "email" | "tel" | "textarea";
  placeholder?: string;
  required?: boolean;
}

export interface RepeaterRow {
  __id: string;
  [key: string]: any;
}

export interface RepeaterProps {
  fields: RepeaterField[];
  value: RepeaterRow[];
  onChange: (rows: RepeaterRow[]) => void;
  addButtonLabel?: string;
  minRows?: number;
  maxRows?: number;
  className?: string;
}

/**
 * Generic repeater component for dynamic rows
 * Used for properties, debts, accounts, and other lists
 */
export function Repeater({
  fields,
  value = [],
  onChange,
  addButtonLabel = "הוסף שורה",
  minRows = 1,
  maxRows = 20,
  className,
}: RepeaterProps) {
  // Ensure at least minRows exist with stable IDs
  React.useEffect(() => {
    if (value.length < minRows) {
      const newRows: RepeaterRow[] = [];
      for (let i = value.length; i < minRows; i++) {
        newRows.push(createEmptyRow());
      }
      onChange([...value, ...newRows]);
    }
  }, []);

  const handleAddRow = () => {
    if (value.length >= maxRows) return;
    onChange([...value, createEmptyRow()]);
  };

  const handleRemoveRow = (rowId: string) => {
    if (value.length <= minRows) return;
    onChange(value.filter((row) => row.__id !== rowId));
  };

  const handleFieldChange = (rowId: string, fieldName: string, newValue: any) => {
    onChange(
      value.map((row) =>
        row.__id === rowId ? { ...row, [fieldName]: newValue } : row
      )
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {value.map((row, rowIndex) => (
        <div
          key={row.__id}
          className="bg-neutral-lightest rounded-lg p-4 border border-neutral"
        >
          {/* Row number */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-body-small font-semibold text-neutral-dark">
              שורה {rowIndex + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveRow(row.__id)}
              disabled={value.length <= minRows}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 ml-1" />
              הסר
            </Button>
          </div>

          {/* Fields in horizontal layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((field) => (
              <div key={field.id}>
                <label
                  htmlFor={`${row.__id}-${field.name}`}
                  className="block text-body-small font-medium mb-1 text-neutral-darkest"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 mr-1">*</span>
                  )}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={`${row.__id}-${field.name}`}
                    value={row[field.name] || ""}
                    onChange={(e) =>
                      handleFieldChange(row.__id, field.name, e.target.value)
                    }
                    placeholder={field.placeholder}
                    className={cn(
                      "w-full px-3 py-2 rounded bg-white",
                      "border border-neutral transition-smooth",
                      "focus:border-primary focus:ring-2 focus:ring-primary/20",
                      "text-body text-neutral-darkest",
                      "resize-none"
                    )}
                    rows={3}
                  />
                ) : (
                  <input
                    id={`${row.__id}-${field.name}`}
                    type={field.type}
                    value={row[field.name] || ""}
                    onChange={(e) =>
                      handleFieldChange(row.__id, field.name, e.target.value)
                    }
                    placeholder={field.placeholder}
                    className={cn(
                      "w-full px-3 py-2 rounded bg-white",
                      "border border-neutral transition-smooth",
                      "focus:border-primary focus:ring-2 focus:ring-primary/20",
                      "text-body text-neutral-darkest",
                      (field.type === "tel" || field.type === "number") &&
                        "dir-rtl"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add button */}
      {value.length < maxRows && (
        <Button
          type="button"
          variant="outline"
          onClick={handleAddRow}
          className="w-full"
        >
          <Plus className="w-4 h-4 ml-1" />
          {addButtonLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * Create an empty row with a stable unique ID
 */
function createEmptyRow(): RepeaterRow {
  return {
    __id: crypto.randomUUID(),
  };
}
