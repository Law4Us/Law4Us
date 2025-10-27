"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, FormField, Input, Select } from "@/components/ui";
import { useWizardStore } from "@/lib/stores/wizard-store";
import { basicInfoSchema, type BasicInfo } from "@/lib/schemas/basic-info";
import { CLAIMS } from "@/lib/constants/claims";
import { formatPhoneNumber, formatIdNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function Step1ClaimPicker() {
  const router = useRouter();
  const {
    basicInfo,
    selectedClaims,
    updateBasicInfo,
    toggleClaim,
    nextStep,
  } = useWizardStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<BasicInfo>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: basicInfo,
    mode: "onChange",
  });

  const relationshipType = watch("relationshipType");

  // Auto-save on field blur
  const handleFieldBlur = (field: keyof BasicInfo, value: string) => {
    updateBasicInfo({ [field]: value });
  };

  // Auto-format phone and ID numbers
  const handlePhoneBlur = (field: "phone" | "phone2") => {
    const value = watch(field);
    if (value) {
      const formatted = formatPhoneNumber(value);
      setValue(field, formatted);
      updateBasicInfo({ [field]: formatted });
    }
  };

  const handleIdBlur = (field: "idNumber" | "idNumber2") => {
    const value = watch(field);
    if (value) {
      const formatted = formatIdNumber(value);
      setValue(field, formatted);
      updateBasicInfo({ [field]: formatted });
    }
  };

  const onSubmit = (data: BasicInfo) => {
    updateBasicInfo(data);
    nextStep();
    router.push("/wizard/step-2");
  };

  const canProceed = isValid && selectedClaims.length > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-h1 font-bold mb-2">פרטים בסיסיים</h1>
        <p className="text-body text-neutral-dark">
          מלאו את הפרטים שלכם ושל בן/בת הזוג, ובחרו את סוגי התביעות הרלוונטיים
        </p>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Column 1: Plaintiff */}
        <div className="bg-white rounded-lg p-6 space-y-6">
          <h2 className="text-h2 font-semibold">תובע/בעל/אישה</h2>

          <FormField
            label="שם פרטי ומשפחה"
            htmlFor="fullName"
            required
            error={errors.fullName?.message}
          >
            <Input
              id="fullName"
              placeholder="הקלידו כאן שם מלא"
              {...register("fullName")}
              onBlur={(e) => handleFieldBlur("fullName", e.target.value)}
              error={!!errors.fullName}
            />
          </FormField>

          <FormField
            label="תעודת זהות"
            htmlFor="idNumber"
            required
            error={errors.idNumber?.message}
          >
            <Input
              id="idNumber"
              placeholder="הקלידו כאן ת.ז"
              {...register("idNumber")}
              onBlur={() => handleIdBlur("idNumber")}
              error={!!errors.idNumber}
            />
          </FormField>

          <FormField
            label="כתובת"
            htmlFor="address"
            required
            error={errors.address?.message}
          >
            <Input
              id="address"
              placeholder="הקלידו כאן כתובת"
              {...register("address")}
              onBlur={(e) => handleFieldBlur("address", e.target.value)}
              error={!!errors.address}
            />
          </FormField>

          <FormField
            label="טלפון"
            htmlFor="phone"
            required
            error={errors.phone?.message}
          >
            <Input
              id="phone"
              type="tel"
              placeholder="050-123-4567"
              {...register("phone")}
              onBlur={() => handlePhoneBlur("phone")}
              error={!!errors.phone}
            />
          </FormField>

          <FormField
            label="כתובת מייל"
            htmlFor="email"
            required
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              placeholder="example@mail.com"
              {...register("email")}
              onBlur={(e) => handleFieldBlur("email", e.target.value)}
              error={!!errors.email}
            />
          </FormField>

          <FormField
            label="תאריך לידה"
            htmlFor="birthDate"
            required
            error={errors.birthDate?.message}
          >
            <Input
              id="birthDate"
              type="date"
              {...register("birthDate")}
              onBlur={(e) => handleFieldBlur("birthDate", e.target.value)}
              error={!!errors.birthDate}
            />
          </FormField>
        </div>

        {/* Column 2: Defendant */}
        <div className="bg-white rounded-lg p-6 space-y-6">
          <h2 className="text-h2 font-semibold">נתבע/בעל/אישה</h2>

          <FormField
            label="שם פרטי ומשפחה"
            htmlFor="fullName2"
            required
            error={errors.fullName2?.message}
          >
            <Input
              id="fullName2"
              placeholder="הקלידו כאן שם מלא"
              {...register("fullName2")}
              onBlur={(e) => handleFieldBlur("fullName2", e.target.value)}
              error={!!errors.fullName2}
            />
          </FormField>

          <FormField
            label="תעודת זהות"
            htmlFor="idNumber2"
            required
            error={errors.idNumber2?.message}
          >
            <Input
              id="idNumber2"
              placeholder="הקלידו כאן ת.ז"
              {...register("idNumber2")}
              onBlur={() => handleIdBlur("idNumber2")}
              error={!!errors.idNumber2}
            />
          </FormField>

          <FormField
            label="כתובת"
            htmlFor="address2"
            required
            error={errors.address2?.message}
          >
            <Input
              id="address2"
              placeholder="הקלידו כאן כתובת"
              {...register("address2")}
              onBlur={(e) => handleFieldBlur("address2", e.target.value)}
              error={!!errors.address2}
            />
          </FormField>

          <FormField
            label="טלפון"
            htmlFor="phone2"
            required
            error={errors.phone2?.message}
          >
            <Input
              id="phone2"
              type="tel"
              placeholder="050-123-4567"
              {...register("phone2")}
              onBlur={() => handlePhoneBlur("phone2")}
              error={!!errors.phone2}
            />
          </FormField>

          <FormField
            label="כתובת מייל"
            htmlFor="email2"
            required
            error={errors.email2?.message}
          >
            <Input
              id="email2"
              type="email"
              placeholder="example@mail.com"
              {...register("email2")}
              onBlur={(e) => handleFieldBlur("email2", e.target.value)}
              error={!!errors.email2}
            />
          </FormField>

          <FormField
            label="תאריך לידה"
            htmlFor="birthDate2"
            required
            error={errors.birthDate2?.message}
          >
            <Input
              id="birthDate2"
              type="date"
              {...register("birthDate2")}
              onBlur={(e) => handleFieldBlur("birthDate2", e.target.value)}
              error={!!errors.birthDate2}
            />
          </FormField>
        </div>

        {/* Column 3: Relationship & Claims */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 space-y-6">
            <h2 className="text-h2 font-semibold">עליכם</h2>

            <FormField
              label="סטטוס זוגי"
              htmlFor="relationshipType"
              required
              error={errors.relationshipType?.message}
            >
              <Select
                id="relationshipType"
                {...register("relationshipType")}
                onChange={(e) => {
                  register("relationshipType").onChange(e);
                  updateBasicInfo({ relationshipType: e.target.value as any });
                }}
                error={!!errors.relationshipType}
              >
                <option value="married">נשואים</option>
                <option value="commonLaw">ידועים בציבור</option>
                <option value="separated">גרושים/פרודים</option>
                <option value="notMarried">לא נשואים</option>
              </Select>
            </FormField>

            {relationshipType !== "notMarried" && (
              <FormField
                label="תאריך נישואין"
                htmlFor="weddingDay"
                required
                error={errors.weddingDay?.message}
              >
                <Input
                  id="weddingDay"
                  type="date"
                  {...register("weddingDay")}
                  onBlur={(e) => handleFieldBlur("weddingDay", e.target.value)}
                  error={!!errors.weddingDay}
                />
              </FormField>
            )}

            <div>
              <h3 className="text-h3 font-semibold mb-4">בחרו סוגי תביעות</h3>
              {selectedClaims.length === 0 && (
                <p className="text-caption text-red-500 mb-3">
                  יש לבחור לפחות תביעה אחת
                </p>
              )}
              <div className="space-y-2">
                {CLAIMS.map((claim) => (
                  <button
                    key={claim.key}
                    type="button"
                    onClick={() => toggleClaim(claim.key)}
                    className={cn(
                      "w-full text-right px-4 py-3 rounded-lg transition-smooth",
                      "border-2 font-medium text-body",
                      selectedClaims.includes(claim.key)
                        ? "border-primary bg-neutral-lightest text-neutral-darkest"
                        : "border-transparent bg-neutral-light text-neutral-darkest hover:bg-neutral"
                    )}
                  >
                    {claim.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={!canProceed}
        >
          המשך לשלב הבא
        </Button>
      </div>

      {/* Show validation summary if trying to proceed */}
      {!canProceed && (
        <div className="mt-4 text-center text-body-small text-neutral-dark">
          {!isValid && "אנא מלאו את כל השדות הנדרשים בצורה תקינה"}
          {isValid && selectedClaims.length === 0 && "אנא בחרו לפחות תביעה אחת"}
        </div>
      )}
    </form>
  );
}
