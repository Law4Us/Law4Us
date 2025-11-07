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
import { ProgressiveSection, ProgressiveSections } from "@/components/wizard/progressive-section";
import { ClaimCard } from "@/components/wizard/claim-card";
import { SlideInView } from "@/components/animations/slide-in-view";

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

  // Track which section is currently expanded
  const [expandedSection, setExpandedSection] = React.useState<number>(1);

  // Track section completion
  const [completedSections, setCompletedSections] = React.useState<Set<number>>(
    new Set()
  );

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

  // Check if section 1 is complete (plaintiff info)
  const isSection1Complete = React.useMemo(() => {
    const fields = watch([
      "fullName",
      "idNumber",
      "address",
      "phone",
      "email",
      "birthDate",
      "gender",
    ]);
    return fields.every((field) => field && field !== "");
  }, [watch("fullName"), watch("idNumber"), watch("address"), watch("phone"), watch("email"), watch("birthDate"), watch("gender")]);

  // Check if section 2 is complete (defendant info)
  const isSection2Complete = React.useMemo(() => {
    const fields = watch([
      "fullName2",
      "idNumber2",
      "address2",
      "phone2",
      "email2",
      "birthDate2",
      "gender2",
    ]);
    return fields.every((field) => field && field !== "");
  }, [watch("fullName2"), watch("idNumber2"), watch("address2"), watch("phone2"), watch("email2"), watch("birthDate2"), watch("gender2")]);

  // Check if section 3 is complete (relationship)
  const isSection3Complete = React.useMemo(() => {
    const relType = watch("relationshipType");
    if (relType === "notMarried") return true;
    const wedding = watch("weddingDay");
    return !!(relType && wedding);
  }, [watch("relationshipType"), watch("weddingDay")]);

  // Check if section 4 is complete (claims)
  const isSection4Complete = selectedClaims.length > 0;

  // Update completed sections
  React.useEffect(() => {
    const newCompleted = new Set<number>();
    if (isSection1Complete) newCompleted.add(1);
    if (isSection2Complete) newCompleted.add(2);
    if (isSection3Complete) newCompleted.add(3);
    if (isSection4Complete) newCompleted.add(4);
    setCompletedSections(newCompleted);
  }, [isSection1Complete, isSection2Complete, isSection3Complete, isSection4Complete]);

  // Auto-expand next incomplete section
  const handleSectionToggle = (sectionNumber: number) => {
    setExpandedSection(expandedSection === sectionNumber ? 0 : sectionNumber);
  };

  const onSubmit = (data: BasicInfo) => {
    updateBasicInfo(data);
    nextStep();
    router.push("/wizard/step-2");
  };

  const canProceed = isValid && selectedClaims.length > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
      <SlideInView direction="up" delay={0}>
        <div className="mb-8 text-center">
          <h1 className="text-h1 font-bold mb-2">פרטים בסיסיים</h1>
          <p className="text-body text-neutral-dark">
            מלאו את הפרטים שלכם ושל בן/בת הזוג, ובחרו את סוגי התביעות הרלוונטיים
          </p>
        </div>
      </SlideInView>

      <ProgressiveSections>
        {/* Section 1: Plaintiff Information */}
        <SlideInView direction="up" delay={100}>
          <ProgressiveSection
            number={1}
            title="הפרטים שלך"
            description="מלאו את הפרטים האישיים שלכם"
            isExpanded={expandedSection === 1}
            isCompleted={isSection1Complete}
            canExpand={true}
            onToggle={() => handleSectionToggle(1)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="md:col-span-2"
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

              <FormField
                label="מגדר"
                htmlFor="gender"
                required
                error={errors.gender?.message}
              >
                <Select
                  id="gender"
                  {...register("gender")}
                  onChange={(e) => {
                    register("gender").onChange(e);
                    updateBasicInfo({ gender: e.target.value as any });
                  }}
                  error={!!errors.gender}
                >
                  <option value="">בחרו מגדר</option>
                  <option value="male">זכר</option>
                  <option value="female">נקבה</option>
                </Select>
              </FormField>
            </div>
          </ProgressiveSection>
        </SlideInView>

        {/* Section 2: Defendant Information */}
        <SlideInView direction="up" delay={200}>
          <ProgressiveSection
            number={2}
            title="פרטי הצד השני"
            description="מלאו את הפרטים של בן/בת הזוג"
            isExpanded={expandedSection === 2}
            isCompleted={isSection2Complete}
            canExpand={isSection1Complete}
            onToggle={() => handleSectionToggle(2)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="md:col-span-2"
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

              <FormField
                label="מגדר"
                htmlFor="gender2"
                required
                error={errors.gender2?.message}
              >
                <Select
                  id="gender2"
                  {...register("gender2")}
                  onChange={(e) => {
                    register("gender2").onChange(e);
                    updateBasicInfo({ gender2: e.target.value as any });
                  }}
                  error={!!errors.gender2}
                >
                  <option value="">בחרו מגדר</option>
                  <option value="male">זכר</option>
                  <option value="female">נקבה</option>
                </Select>
              </FormField>
            </div>
          </ProgressiveSection>
        </SlideInView>

        {/* Section 3: Relationship Details */}
        <SlideInView direction="up" delay={300}>
          <ProgressiveSection
            number={3}
            title="פרטי הקשר ביניכם"
            description="מלאו את הפרטים על מצב הזוגיות"
            isExpanded={expandedSection === 3}
            isCompleted={isSection3Complete}
            canExpand={isSection2Complete}
            onToggle={() => handleSectionToggle(3)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="סטטוס זוגי"
                htmlFor="relationshipType"
                required
                error={errors.relationshipType?.message}
                className="md:col-span-2"
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
                  className="md:col-span-2"
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
            </div>
          </ProgressiveSection>
        </SlideInView>

        {/* Section 4: Claims Selection */}
        <SlideInView direction="up" delay={400}>
          <ProgressiveSection
            number={4}
            title="בחירת תביעות"
            description="בחרו את סוגי התביעות הרלוונטיים לתיק שלכם"
            isExpanded={expandedSection === 4}
            isCompleted={isSection4Complete}
            canExpand={isSection3Complete}
            onToggle={() => handleSectionToggle(4)}
          >
            {selectedClaims.length === 0 && expandedSection === 4 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-body-small text-red-600 font-medium">
                  יש לבחור לפחות תביעה אחת כדי להמשיך
                </p>
              </div>
            )}
            <div className="space-y-3">
              {CLAIMS.map((claim) => (
                <ClaimCard
                  key={claim.key}
                  claim={claim}
                  isSelected={selectedClaims.includes(claim.key)}
                  onToggle={() => toggleClaim(claim.key)}
                />
              ))}
            </div>
          </ProgressiveSection>
        </SlideInView>
      </ProgressiveSections>

      {/* Navigation */}
      <SlideInView direction="up" delay={500}>
        <div className="mt-8 flex justify-end">
          <Button type="submit" size="lg" disabled={!canProceed}>
            המשך לשלב הבא
          </Button>
        </div>

        {/* Validation summary */}
        {!canProceed && (
          <div className="mt-4 text-center text-body-small text-neutral-dark">
            {!isValid && "אנא מלאו את כל השדות הנדרשים בצורה תקינה"}
            {isValid && selectedClaims.length === 0 && "אנא בחרו לפחות תביעה אחת"}
          </div>
        )}
      </SlideInView>
    </form>
  );
}
