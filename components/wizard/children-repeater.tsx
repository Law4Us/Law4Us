"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Input, Textarea, FormField } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatIdNumber } from "@/lib/utils/format";
import { validateIsraeliId } from "@/lib/utils/validation";

export interface Child {
  __id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  idNumber: string;
  details: string;
}

export interface ChildrenRepeaterProps {
  value: Child[];
  onChange: (children: Child[]) => void;
  minChildren?: number;
  maxChildren?: number;
  className?: string;
}

/**
 * Special repeater for children with unique 2-column layout:
 * Left: Details (textarea, full height)
 * Right: 2x2 grid (firstName, lastName, birthDate, idNumber)
 */
export function ChildrenRepeater({
  value = [],
  onChange,
  minChildren = 0,
  maxChildren = 10,
  className,
}: ChildrenRepeaterProps) {
  const handleAddChild = () => {
    if (value.length >= maxChildren) return;
    onChange([...value, createEmptyChild()]);
  };

  const handleRemoveChild = (childId: string) => {
    if (value.length <= minChildren) return;
    onChange(value.filter((child) => child.__id !== childId));
  };

  const handleFieldChange = (
    childId: string,
    fieldName: keyof Child,
    newValue: any
  ) => {
    onChange(
      value.map((child) =>
        child.__id === childId ? { ...child, [fieldName]: newValue } : child
      )
    );
  };

  const handleIdBlur = (childId: string, idValue: string) => {
    const formatted = formatIdNumber(idValue);
    handleFieldChange(childId, "idNumber", formatted);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {value.map((child, index) => (
        <div
          key={child.__id}
          className="bg-neutral-lightest rounded-lg p-6 border border-neutral"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral">
            <h4 className="text-body-large font-semibold text-neutral-darkest">
              ילד/ה {index + 1}
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveChild(child.__id)}
              disabled={value.length <= minChildren}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 ml-1" />
              הסר ילד/ה
            </Button>
          </div>

          {/* 2-column layout: Details (left) | Info grid (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Details textarea (full height) */}
            <div className="flex flex-col">
              <FormField
                label="פרטים נוספים"
                htmlFor={`${child.__id}-details`}
                helper="מצב בריאותי, טיפולים, צרכים מיוחדים, וכו'"
              >
                <Textarea
                  id={`${child.__id}-details`}
                  value={child.details || ""}
                  onChange={(e) =>
                    handleFieldChange(child.__id, "details", e.target.value)
                  }
                  placeholder="תארו כל פרט רלוונטי על הילד/ה..."
                  className="h-full min-h-[200px]"
                />
              </FormField>
            </div>

            {/* Right: 2x2 grid of info fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="שם פרטי"
                htmlFor={`${child.__id}-firstName`}
                required
              >
                <Input
                  id={`${child.__id}-firstName`}
                  type="text"
                  value={child.firstName || ""}
                  onChange={(e) =>
                    handleFieldChange(child.__id, "firstName", e.target.value)
                  }
                  placeholder="שם פרטי"
                />
              </FormField>

              <FormField
                label="שם משפחה"
                htmlFor={`${child.__id}-lastName`}
                required
              >
                <Input
                  id={`${child.__id}-lastName`}
                  type="text"
                  value={child.lastName || ""}
                  onChange={(e) =>
                    handleFieldChange(child.__id, "lastName", e.target.value)
                  }
                  placeholder="שם משפחה"
                />
              </FormField>

              <FormField
                label="תאריך לידה"
                htmlFor={`${child.__id}-birthDate`}
                required
              >
                <Input
                  id={`${child.__id}-birthDate`}
                  type="date"
                  value={child.birthDate || ""}
                  onChange={(e) =>
                    handleFieldChange(child.__id, "birthDate", e.target.value)
                  }
                />
              </FormField>

              <FormField
                label="תעודת זהות"
                htmlFor={`${child.__id}-idNumber`}
                required
                error={
                  child.idNumber &&
                  !validateIsraeliId(child.idNumber)
                    ? "מספר זהות לא תקין"
                    : undefined
                }
              >
                <Input
                  id={`${child.__id}-idNumber`}
                  type="text"
                  value={child.idNumber || ""}
                  onChange={(e) =>
                    handleFieldChange(child.__id, "idNumber", e.target.value)
                  }
                  onBlur={(e) => handleIdBlur(child.__id, e.target.value)}
                  placeholder="000000000"
                  maxLength={11}
                  error={
                    !!(child.idNumber && !validateIsraeliId(child.idNumber))
                  }
                />
              </FormField>
            </div>
          </div>
        </div>
      ))}

      {/* Add button */}
      {value.length < maxChildren && (
        <Button
          type="button"
          variant="outline"
          onClick={handleAddChild}
          className="w-full"
        >
          <Plus className="w-4 h-4 ml-1" />
          הוסף ילד/ה
        </Button>
      )}

      {value.length === 0 && (
        <div className="text-center py-8 text-neutral-dark">
          <p className="text-body">לא הוספתם ילדים עדיין</p>
          <p className="text-body-small">לחצו על "הוסף ילד/ה" להוספת ילד</p>
        </div>
      )}
    </div>
  );
}

/**
 * Create an empty child object with a stable unique ID
 */
function createEmptyChild(): Child {
  return {
    __id: crypto.randomUUID(),
    firstName: "",
    lastName: "",
    birthDate: "",
    idNumber: "",
    details: "",
  };
}
