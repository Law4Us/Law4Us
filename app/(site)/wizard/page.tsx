"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HelpCircle, ListChecks } from "lucide-react";
import { Button, FormField, Input, Select } from "@/components/ui";
import { DatePicker } from "@/components/ui/date-picker";
import { scrollToFirstError } from "@/lib/utils/scroll-to-error";
import { useWizardStore } from "@/lib/stores/wizard-store";
import { basicInfoSchema, type BasicInfo } from "@/lib/schemas/basic-info";
import { CLAIMS } from "@/lib/constants/claims";
import { formatPhoneNumber, formatIdNumber, cn } from "@/lib/utils";
import { ProgressiveSection, ProgressiveSections } from "@/components/wizard/progressive-section";
import { ClaimCard } from "@/components/wizard/claim-card";
import { SlideInView } from "@/components/animations/slide-in-view";
import { RoutingQuestions } from "@/components/wizard/routing-questions";
import type { ClaimType, RecommendedCourt, WizardPath } from "@/lib/types";

export default function Step1ClaimPicker() {
  const router = useRouter();
  const {
    basicInfo,
    selectedClaims,
    updateBasicInfo,
    toggleClaim,
    setSelectedClaims,
    nextStep,
    sessionId,
    currentStep,
    wizardPath,
    setWizardPath,
    setRecommendedCourt,
  } = useWizardStore();

  // Check for existing session and offer to resume
  React.useEffect(() => {
    const checkForSession = async () => {
      // Only check if we have a sessionId and we're at the beginning
      if (!sessionId || currentStep > 0) {
        return;
      }

      try {
        console.log('🔍 Checking if session is still valid:', sessionId);

        const response = await fetch(`/api/sessions/${sessionId}`);
        const data = await response.json();

        if (response.ok && data.success && data.session) {
          // Session exists and is valid
          const session = data.session;
          const isPaid = session.paymentStatus === 'paid';
          const isSubmitted = session.submissionStatus === 'submitted';

          // Ask user if they want to resume
          const shouldResume = window.confirm(
            isPaid
              ? 'מצאנו בקשה שכבר שילמת עבורה! האם תרצה להמשיך ולהשלים את השליחה?'
              : 'מצאנו בקשה שמורה שלך. האם תרצה להמשיך מהמקום שבו עצרת?'
          );

          if (shouldResume) {
            // Redirect to resume page
            router.push(`/resume/${sessionId}`);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // Silently fail - don't interrupt user experience
      }
    };

    checkForSession();
  }, [sessionId, currentStep, router]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
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
  // Note: phone2 and email2 are optional, so we don't require them
  const isSection2Complete = React.useMemo(() => {
    const requiredFields = watch([
      "fullName2",
      "idNumber2",
      "address2",
      "birthDate2",
      "gender2",
    ]);
    return requiredFields.every((field) => field && field !== "");
  }, [watch("fullName2"), watch("idNumber2"), watch("address2"), watch("birthDate2"), watch("gender2")]);

  // Check if section 3 is complete (relationship)
  const isSection3Complete = React.useMemo(() => {
    const relType = watch("relationshipType");
    if (relType === "notMarried") return true;
    const wedding = watch("weddingDay");
    return !!(relType && wedding);
  }, [watch("relationshipType"), watch("weddingDay")]);

  // Track if guided flow is complete
  const [guidedFlowComplete, setGuidedFlowComplete] = React.useState(false);

  // Check if section 4 is complete (claims)
  // For guided path, need to complete the routing flow
  // For direct path, need to select at least one claim
  const isSection4Complete = wizardPath === "guided"
    ? guidedFlowComplete && selectedClaims.length > 0
    : wizardPath === "direct"
    ? selectedClaims.length > 0
    : false;

  // Handle routing questions completion
  const handleRoutingComplete = (claims: ClaimType[], court: RecommendedCourt) => {
    setSelectedClaims(claims);
    setRecommendedCourt(court);
    setGuidedFlowComplete(true);
  };

  // Path selection handler
  const handlePathSelect = (path: WizardPath) => {
    setWizardPath(path);
    setGuidedFlowComplete(false);
    if (path === "direct") {
      // Clear any previous routing selections when switching to direct
      setSelectedClaims([]);
    }
  };

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

  // Handle form errors - scroll to first error
  const onError = (formErrors: typeof errors) => {
    scrollToFirstError(formErrors as Record<string, unknown>);
  };

  const canProceed = isValid && selectedClaims.length > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="max-w-4xl mx-auto">
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
                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      id="birthDate"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        updateBasicInfo({ birthDate: value });
                      }}
                      onBlur={field.onBlur}
                      error={!!errors.birthDate}
                      maxDate={new Date()}
                    />
                  )}
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
                optional
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
                optional
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
                <Controller
                  name="birthDate2"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      id="birthDate2"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        updateBasicInfo({ birthDate2: value });
                      }}
                      onBlur={field.onBlur}
                      error={!!errors.birthDate2}
                      maxDate={new Date()}
                    />
                  )}
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
                  <Controller
                    name="weddingDay"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        id="weddingDay"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          updateBasicInfo({ weddingDay: value });
                        }}
                        onBlur={field.onBlur}
                        error={!!errors.weddingDay}
                        maxDate={new Date()}
                      />
                    )}
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
            {/* Path Selection */}
            {!wizardPath && (
              <div className="space-y-4">
                <p className="text-body text-neutral-dark mb-4">כיצד תרצו להמשיך?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* I know what I need */}
                  <button
                    type="button"
                    onClick={() => handlePathSelect("direct")}
                    className={cn(
                      "relative w-full text-right rounded-xl py-6 px-6 transition-all duration-300",
                      "border-2 bg-white hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/20",
                      "border-neutral-light hover:border-primary"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <ListChecks className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-neutral-darkest mb-1">
                          אני יודע/ת מה אני צריך/ה
                        </h4>
                        <p className="text-sm text-neutral-dark">
                          אבחר את סוגי התביעות בעצמי
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* I need help */}
                  <button
                    type="button"
                    onClick={() => handlePathSelect("guided")}
                    className={cn(
                      "relative w-full text-right rounded-xl py-6 px-6 transition-all duration-300",
                      "border-2 bg-white hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/20",
                      "border-neutral-light hover:border-primary"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <HelpCircle className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-neutral-darkest mb-1">
                          אני צריך/ה עזרה להבין מה מתאים לי
                        </h4>
                        <p className="text-sm text-neutral-dark">
                          נשאל כמה שאלות ונמליץ על החבילה המתאימה
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Guided Path - Routing Questions */}
            {wizardPath === "guided" && !guidedFlowComplete && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setWizardPath(null)}
                  className="text-sm text-primary hover:text-primary-dark transition-colors mb-4"
                >
                  ← חזרה לבחירת מסלול
                </button>
                <RoutingQuestions onComplete={handleRoutingComplete} />
              </div>
            )}

            {/* Guided Path - Completed - Show selected claims */}
            {wizardPath === "guided" && guidedFlowComplete && selectedClaims.length > 0 && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    setGuidedFlowComplete(false);
                    setSelectedClaims([]);
                  }}
                  className="text-sm text-primary hover:text-primary-dark transition-colors mb-4"
                >
                  ← חזרה לשאלות ניתוב
                </button>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <p className="text-body font-medium text-green-800">
                    התביעות נבחרו בהתאם למצבך. לחצו &quot;המשך לשלב הבא&quot; כדי להמשיך.
                  </p>
                </div>
                <div className="space-y-3">
                  {selectedClaims.map((claimKey) => {
                    const claim = CLAIMS.find(c => c.key === claimKey);
                    if (!claim) return null;
                    return (
                      <ClaimCard
                        key={claim.key}
                        claim={claim}
                        isSelected={true}
                        onToggle={() => {}} // Read-only in guided mode
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Direct Path - Manual Claim Selection */}
            {wizardPath === "direct" && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    setWizardPath(null);
                    setSelectedClaims([]);
                  }}
                  className="text-sm text-primary hover:text-primary-dark transition-colors mb-4"
                >
                  ← חזרה לבחירת מסלול
                </button>

                {selectedClaims.includes("divorceRabbinical") &&
                 !(selectedClaims.includes("property") &&
                   selectedClaims.includes("custody") &&
                   selectedClaims.includes("alimony")) && (
                  <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-6 py-4 text-right">
                    <p className="text-body font-semibold text-amber-900">
                      לתשומת לבכם: תביעת גירושין בבית הדין הרבני כרוכה בהגשת תביעות נלוות (רכוש, מזונות, משמורת).
                    </p>
                    <p className="text-caption text-amber-800 mt-1">
                      מומלץ לסמן גם את התביעות הרלוונטיות כדי שנוכל למלא את כלל הטפסים והנספחים עבורך.
                    </p>
                  </div>
                )}

                {selectedClaims.length === 0 && (
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
              </div>
            )}
          </ProgressiveSection>
        </SlideInView>
      </ProgressiveSections>

      {/* Navigation */}
      <SlideInView direction="up" delay={500}>
        <div className="mt-8 flex justify-end">
          <Button type="submit" size="lg" disabled={!canProceed} className="text-white">
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
