"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWizardStore } from "@/lib/stores/wizard-store";
import { formatCurrency } from "@/lib/utils/format";
import { CLAIMS } from "@/lib/constants/claims";
import type { RoutingAnswers, RecommendedCourt, ClaimType } from "@/lib/types";

interface RoutingQuestionsProps {
  onComplete: (claims: ClaimType[], court: RecommendedCourt) => void;
}

type RoutingStep = "situation" | "infidelity" | "children" | "income" | "property" | "halachic" | "result";

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

/**
 * RoutingQuestions - Multi-step questionnaire for guided court routing
 *
 * Asks users questions to determine the best court (family vs rabbinical)
 * and recommends appropriate claims based on their situation.
 */
export function RoutingQuestions({ onComplete }: RoutingQuestionsProps) {
  const { routingAnswers, updateRoutingAnswers, setRecommendedCourt, basicInfo } = useWizardStore();

  const [currentStep, setCurrentStep] = useState<RoutingStep>("situation");
  const [recommendation, setRecommendation] = useState<{
    court: RecommendedCourt;
    claims: ClaimType[];
    totalPrice: number;
  } | null>(null);

  // For "specific" flow - user selects claims manually
  const [specificClaims, setSpecificClaims] = useState<ClaimType[]>([]);

  // Available claims for specific selection (exclude divorce-related bundle claims)
  const specificClaimOptions = CLAIMS.filter(
    c => c.key === "property" || c.key === "custody" || c.key === "alimony"
  );

  // Calculate court recommendation based on answers
  const calculateRecommendation = useCallback(() => {
    const answers = routingAnswers;
    let familyScore = 0;
    let rabbinicalScore = 0;

    // Force Family Court if infidelity
    if (answers.hasInfidelity === "yes") {
      familyScore += 100;
    }

    // Young children lean Family Court
    if (answers.youngestChildAge === "under6") {
      familyScore += 2;
    }

    // Income disparity leans Rabbinical
    if (answers.applicantIncome && answers.respondentIncome) {
      const higher = Math.max(answers.applicantIncome, answers.respondentIncome);
      const lower = Math.min(answers.applicantIncome, answers.respondentIncome);
      if (lower > 0 && higher / lower >= 2) {
        rabbinicalScore += 3;
      }
    }

    // Significant property leans Rabbinical
    if (answers.propertyValue === "2to4m" || answers.propertyValue === "over4m") {
      rabbinicalScore += 2;
    }
    if (answers.propertyTypes?.includes("business")) {
      rabbinicalScore += 2;
    }

    // Halachic grounds lean Rabbinical
    if (answers.halachicGrounds === "refusesRelations" || answers.halachicGrounds === "cantHaveChildren") {
      rabbinicalScore += 3;
    }

    // Default heavily weighted to Family Court
    familyScore += 5;

    const court: RecommendedCourt = rabbinicalScore >= familyScore ? "rabbinical" : "family";

    let claims: ClaimType[];
    let totalPrice: number;

    // Determine if there are children and applicant's gender
    const hasChildren = answers.youngestChildAge !== "none";
    const applicantIsFemale = basicInfo?.gender === "female";

    if (court === "rabbinical") {
      // Rabbinical court - bundled divorce with all claims included
      claims = ["divorceRabbinical"];
      totalPrice = 3900;
    } else {
      // Family court path - separate claims only (NO divorce document!)
      // Divorce itself happens at Rabbinical Court - Family Court handles only separate claims
      if (hasChildren) {
        // Has children: custody + alimony (children) + property
        claims = ["custody", "alimony", "property"];
        totalPrice = 3900 * 3; // 11,700
      } else if (applicantIsFemale) {
        // No children + female applicant: property + alimony (spousal/מזונות אישה)
        claims = ["alimony", "property"];
        totalPrice = 3900 * 2; // 7,800
      } else {
        // No children + male applicant: property only
        claims = ["property"];
        totalPrice = 3900; // 3,900
      }
    }

    return { court, claims, totalPrice };
  }, [routingAnswers, basicInfo]);

  // Determine next step based on answers
  const getNextStep = (current: RoutingStep): RoutingStep => {
    const answers = routingAnswers;

    switch (current) {
      case "situation":
        // If agreement or shalomBayit, go straight to result with that selection
        if (answers.situation === "agreement" || answers.situation === "shalomBayit" || answers.situation === "specific") {
          return "result";
        }
        // For divorce/defense, ask about infidelity
        return "infidelity";

      case "infidelity":
        return "children";

      case "children":
        // If no children, skip to income
        if (answers.youngestChildAge === "none") {
          return "income";
        }
        return "income";

      case "income":
        return "property";

      case "property":
        // Only ask halachic if not already forced to family court
        if (answers.hasInfidelity !== "yes") {
          return "halachic";
        }
        return "result";

      case "halachic":
        return "result";

      default:
        return "result";
    }
  };

  const getPrevStep = (current: RoutingStep): RoutingStep | null => {
    switch (current) {
      case "infidelity":
        return "situation";
      case "children":
        return "infidelity";
      case "income":
        return "children";
      case "property":
        return "income";
      case "halachic":
        return "property";
      case "result":
        if (routingAnswers.situation === "agreement" || routingAnswers.situation === "shalomBayit" || routingAnswers.situation === "specific") {
          return "situation";
        }
        return routingAnswers.hasInfidelity !== "yes" ? "halachic" : "property";
      default:
        return null;
    }
  };

  const handleNext = () => {
    const nextStep = getNextStep(currentStep);
    if (nextStep === "result") {
      // Handle special cases
      if (routingAnswers.situation === "agreement") {
        setRecommendation({ court: null, claims: ["divorceAgreement"], totalPrice: 3900 });
      } else if (routingAnswers.situation === "shalomBayit") {
        setRecommendation({ court: null, claims: ["shalomBayit"], totalPrice: 3900 });
      } else if (routingAnswers.situation === "specific") {
        // Let user pick specific claims - show result with empty selection
        setRecommendation({ court: "family", claims: [], totalPrice: 0 });
      } else {
        const result = calculateRecommendation();
        setRecommendation(result);
        setRecommendedCourt(result.court);
      }
    }
    setCurrentStep(nextStep);
  };

  const handleBack = () => {
    const prevStep = getPrevStep(currentStep);
    if (prevStep) {
      setCurrentStep(prevStep);
      setRecommendation(null);
    }
  };

  const handleComplete = () => {
    if (recommendation) {
      // For specific claims, use the user's selection
      if (routingAnswers.situation === "specific") {
        onComplete(specificClaims, "family");
      } else {
        onComplete(recommendation.claims, recommendation.court);
      }
    }
  };

  // Radio button component
  const RadioOption = ({ option, selected, onSelect }: { option: RadioOption; selected: boolean; onSelect: () => void }) => (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-right rounded-xl py-4 px-6 transition-all duration-200",
        "border-2 bg-white",
        "hover:shadow-md focus:outline-none focus:ring-4 focus:ring-primary/20",
        selected
          ? "border-primary shadow-sm"
          : "border-neutral-light hover:border-neutral"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <span className={cn(
            "text-body font-medium",
            selected ? "text-primary" : "text-neutral-darkest"
          )}>
            {option.label}
          </span>
          {option.description && (
            <p className="text-sm text-neutral-dark mt-1">{option.description}</p>
          )}
        </div>
        <div className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
          selected ? "bg-primary border-primary" : "border-neutral"
        )}>
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>
    </button>
  );

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case "situation":
        return (
          <div className="space-y-4">
            <h3 className="text-h3 font-semibold text-neutral-darkest mb-4">מה הסיטואציה שלך?</h3>
            <div className="space-y-3">
              {[
                { value: "agreement", label: "אנחנו רוצים להתגרש בהסכמה", description: "נסדר את כל הפרטים יחד בהסכם מוסכם" },
                { value: "shalomBayit", label: "אני רוצה לנסות להציל את הנישואין", description: "הגשת תביעה לשלום בית בבית הדין הרבני" },
                { value: "divorce", label: "אני רוצה להגיש תביעת גירושין", description: "תביעה יזומה לגירושין" },
                { value: "defense", label: "קיבלתי תביעת גירושין ואני צריך/ה להגן על עצמי", description: "הכנת כתב הגנה ותביעות נגדיות" },
                { value: "specific", label: "יש לי עניין ספציפי בלבד", description: "רק רכוש, משמורת או מזונות" },
              ].map((opt) => (
                <RadioOption
                  key={opt.value}
                  option={opt}
                  selected={routingAnswers.situation === opt.value}
                  onSelect={() => updateRoutingAnswers({ situation: opt.value as RoutingAnswers["situation"] })}
                />
              ))}
            </div>
          </div>
        );

      case "infidelity":
        return (
          <div className="space-y-4">
            <h3 className="text-h3 font-semibold text-neutral-darkest mb-4">האם יש בגידה שמעורבת בעניין?</h3>
            <p className="text-sm text-neutral-dark mb-4">שאלה זו חשובה לקביעת הערכאה המתאימה. בית הדין הרבני אינו דן בעניינים הקשורים לבגידה.</p>
            <div className="space-y-3">
              {[
                { value: "yes", label: "כן" },
                { value: "no", label: "לא" },
                { value: "preferNotToSay", label: "מעדיף/ה לא לומר" },
              ].map((opt) => (
                <RadioOption
                  key={opt.value}
                  option={opt}
                  selected={routingAnswers.hasInfidelity === opt.value}
                  onSelect={() => updateRoutingAnswers({ hasInfidelity: opt.value as RoutingAnswers["hasInfidelity"] })}
                />
              ))}
            </div>
          </div>
        );

      case "children":
        return (
          <div className="space-y-4">
            <h3 className="text-h3 font-semibold text-neutral-darkest mb-4">מה גיל הילד/ה הצעיר/ה ביותר?</h3>
            <div className="space-y-3">
              {[
                { value: "none", label: "אין ילדים" },
                { value: "under6", label: "מתחת לגיל 6" },
                { value: "6to12", label: "6-12" },
                { value: "over12", label: "מעל 12" },
              ].map((opt) => (
                <RadioOption
                  key={opt.value}
                  option={opt}
                  selected={routingAnswers.youngestChildAge === opt.value}
                  onSelect={() => updateRoutingAnswers({ youngestChildAge: opt.value as RoutingAnswers["youngestChildAge"] })}
                />
              ))}
            </div>
          </div>
        );

      case "income":
        return (
          <div className="space-y-4">
            <h3 className="text-h3 font-semibold text-neutral-darkest mb-4">מה ההכנסות החודשיות נטו?</h3>
            <p className="text-sm text-neutral-dark mb-4">מידע זה עוזר לנו להמליץ על הערכאה המתאימה ביותר למצבכם.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-body font-medium text-neutral-darkest mb-2">ההכנסה שלך (ש&quot;ח)</label>
                <input
                  type="number"
                  value={routingAnswers.applicantIncome || ""}
                  onChange={(e) => updateRoutingAnswers({ applicantIncome: Number(e.target.value) || undefined })}
                  placeholder="לדוגמה: 15000"
                  className="w-full px-4 py-3 rounded-lg border-2 border-neutral-light focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-body font-medium text-neutral-darkest mb-2">ההכנסה של בן/בת הזוג (ש&quot;ח)</label>
                <input
                  type="number"
                  value={routingAnswers.respondentIncome || ""}
                  onChange={(e) => updateRoutingAnswers({ respondentIncome: Number(e.target.value) || undefined })}
                  placeholder="לדוגמה: 12000"
                  className="w-full px-4 py-3 rounded-lg border-2 border-neutral-light focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        );

      case "property":
        return (
          <div className="space-y-4">
            <h3 className="text-h3 font-semibold text-neutral-darkest mb-4">האם יש לכם רכוש משותף לחלק?</h3>
            <div className="space-y-3">
              {[
                { value: "apartment", label: "דירה/בית משותף" },
                { value: "car", label: "רכב/ים" },
                { value: "savings", label: "חסכונות/קרנות פנסיה" },
                { value: "business", label: "עסק משותף" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-lightest cursor-pointer">
                  <input
                    type="checkbox"
                    checked={routingAnswers.propertyTypes?.includes(opt.value) || false}
                    onChange={(e) => {
                      const current = routingAnswers.propertyTypes || [];
                      const updated = e.target.checked
                        ? [...current, opt.value]
                        : current.filter((v) => v !== opt.value);
                      updateRoutingAnswers({ propertyTypes: updated });
                    }}
                    className="w-5 h-5 rounded border-2 border-neutral text-primary focus:ring-primary"
                  />
                  <span className="text-body text-neutral-darkest">{opt.label}</span>
                </label>
              ))}
            </div>

            {routingAnswers.propertyTypes?.includes("apartment") && (
              <div className="mt-6">
                <h4 className="text-body font-medium text-neutral-darkest mb-3">מה השווי המשוער של הדירה?</h4>
                <div className="space-y-2">
                  {[
                    { value: "under1m", label: "עד 1 מיליון ש״ח" },
                    { value: "1to2m", label: "1-2 מיליון ש״ח" },
                    { value: "2to4m", label: "2-4 מיליון ש״ח" },
                    { value: "over4m", label: "מעל 4 מיליון ש״ח" },
                    { value: "unknown", label: "לא יודע/ת" },
                  ].map((opt) => (
                    <RadioOption
                      key={opt.value}
                      option={opt}
                      selected={routingAnswers.propertyValue === opt.value}
                      onSelect={() => updateRoutingAnswers({ propertyValue: opt.value as RoutingAnswers["propertyValue"] })}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "halachic":
        return (
          <div className="space-y-4">
            <h3 className="text-h3 font-semibold text-neutral-darkest mb-4">האם יש עילה הלכתית לגירושין?</h3>
            <p className="text-sm text-neutral-dark mb-4">עילות הלכתיות עשויות להשפיע על ההמלצה לערכאה המתאימה.</p>
            <div className="space-y-3">
              {[
                { value: "refusesRelations", label: "הצד השני מסרב לקיים יחסי אישות" },
                { value: "cantHaveChildren", label: "הצד השני לא מסוגל להביא ילדים" },
                { value: "none", label: "אין עילה מיוחדת" },
                { value: "unsure", label: "לא בטוח/ה" },
              ].map((opt) => (
                <RadioOption
                  key={opt.value}
                  option={opt}
                  selected={routingAnswers.halachicGrounds === opt.value}
                  onSelect={() => updateRoutingAnswers({ halachicGrounds: opt.value as RoutingAnswers["halachicGrounds"] })}
                />
              ))}
            </div>
          </div>
        );

      case "result":
        if (!recommendation) return null;

        // Special case: specific claims - user will pick from claim cards
        if (routingAnswers.situation === "specific") {
          const toggleSpecificClaim = (claimKey: ClaimType) => {
            setSpecificClaims(prev =>
              prev.includes(claimKey)
                ? prev.filter(c => c !== claimKey)
                : [...prev, claimKey]
            );
          };

          const totalPrice = specificClaims.length * 3900;

          return (
            <div className="space-y-6">
              <div className="bg-primary/5 rounded-2xl p-6">
                <h3 className="text-h3 font-semibold text-primary mb-2">בחירת תביעות ספציפיות</h3>
                <p className="text-body text-neutral-dark">
                  בחרו את התביעות שמתאימות למצבכם:
                </p>
              </div>

              {/* Claim selection cards */}
              <div className="space-y-3">
                {specificClaimOptions.map((claim) => (
                  <button
                    key={claim.key}
                    type="button"
                    onClick={() => toggleSpecificClaim(claim.key)}
                    className={cn(
                      "w-full text-right rounded-xl py-4 px-6 transition-all duration-200",
                      "border-2 bg-white",
                      "hover:shadow-md focus:outline-none focus:ring-4 focus:ring-primary/20",
                      specificClaims.includes(claim.key)
                        ? "border-primary shadow-sm"
                        : "border-neutral-light hover:border-neutral"
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <span className={cn(
                          "text-body font-medium",
                          specificClaims.includes(claim.key) ? "text-primary" : "text-neutral-darkest"
                        )}>
                          {claim.label}
                        </span>
                        <p className="text-sm text-neutral-dark mt-1">{claim.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-body font-medium text-neutral-dark">{formatCurrency(claim.price)}</span>
                        <div className={cn(
                          "w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0",
                          specificClaims.includes(claim.key) ? "bg-primary border-primary" : "border-neutral"
                        )}>
                          {specificClaims.includes(claim.key) && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Total price */}
              {specificClaims.length > 0 && (
                <div className="bg-white rounded-xl border-2 border-neutral-light p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-body font-medium text-neutral-dark">סה&quot;כ ({specificClaims.length} תביעות)</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              )}

              {specificClaims.length === 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-body-small text-amber-700 font-medium">
                    יש לבחור לפחות תביעה אחת כדי להמשיך
                  </p>
                </div>
              )}
            </div>
          );
        }

        // Special case: agreement or shalomBayit
        if (routingAnswers.situation === "agreement" || routingAnswers.situation === "shalomBayit") {
          const label = routingAnswers.situation === "agreement" ? "הסכם גירושין" : "תביעת שלום בית";
          return (
            <div className="space-y-6">
              <div className="bg-primary/5 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="w-6 h-6 text-primary" />
                  <h3 className="text-h3 font-semibold text-primary">בהתאם למצבך, אנחנו ממליצים:</h3>
                </div>
                <div className="bg-white rounded-xl p-6 mt-4">
                  <h4 className="text-xl font-bold text-neutral-darkest mb-4">{label}</h4>
                  <div className="border-t border-neutral-light pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-body font-medium text-neutral-dark">סה&quot;כ</span>
                      <span className="text-2xl font-bold text-primary">{formatCurrency(3900)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // Divorce recommendation
        const isRabbinical = recommendation.court === "rabbinical";

        // Map claim types to Hebrew labels
        const claimLabels: Record<ClaimType, string> = {
          custody: "תביעת משמורת",
          alimony: "תביעת מזונות",
          property: "תביעת רכושית",
          divorceAgreement: "הסכם גירושין",
          divorceRabbinical: "חבילת גירושין רבני",
          shalomBayit: "תביעת שלום בית",
        };

        // Determine context message based on children/gender
        const hasChildren = routingAnswers.youngestChildAge !== "none";
        const applicantIsFemale = basicInfo?.gender === "female";
        let contextMessage = "";
        if (!isRabbinical) {
          if (hasChildren) {
            contextMessage = "יש לך ילדים, לכן כללנו תביעות משמורת ומזונות ילדים.";
          } else if (applicantIsFemale) {
            contextMessage = "את עשויה להיות זכאית למזונות אישה גם ללא ילדים.";
          } else {
            contextMessage = "ללא ילדים, התמקדנו בחלוקת הרכוש.";
          }
        }

        return (
          <div className="space-y-6">
            <div className="bg-primary/5 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Check className="w-6 h-6 text-primary" />
                <h3 className="text-h3 font-semibold text-primary">בהתאם למצבך, אנחנו ממליצים:</h3>
              </div>

              <div className="bg-white rounded-xl p-6 mt-4">
                <h4 className="text-xl font-bold text-neutral-darkest mb-4">
                  {isRabbinical ? "חבילת גירושין רבני" : "גירושין בבית המשפט לענייני משפחה"}
                </h4>

                {contextMessage && (
                  <p className="text-sm text-neutral-dark mb-4 bg-neutral-lightest p-3 rounded-lg">{contextMessage}</p>
                )}

                {isRabbinical ? (
                  <div className="space-y-3">
                    <p className="text-sm text-primary font-medium">הכל כלול במחיר אחד:</p>
                    <ul className="space-y-2">
                      {["תביעת גירושין", "כריכת משמורת", "כריכת מזונות", "כריכת רכוש"].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary" />
                          <span className="text-body text-neutral-darkest">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recommendation.claims.map((claimKey) => (
                      <div key={claimKey} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary" />
                          <span className="text-body text-neutral-darkest">{claimLabels[claimKey]}</span>
                        </div>
                        <span className="text-body text-neutral-dark">{formatCurrency(3900)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-neutral-light pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-body font-medium text-neutral-dark">סה&quot;כ ({recommendation.claims.length} תביעות)</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(recommendation.totalPrice)}</span>
                  </div>
                  {isRabbinical && (
                    <p className="text-sm text-green-600 mt-2">חיסכון של {formatCurrency(15600 - 3900)} לעומת בית המשפט לענייני משפחה</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Check if current step is valid to proceed
  const canProceed = (): boolean => {
    switch (currentStep) {
      case "situation":
        return !!routingAnswers.situation;
      case "infidelity":
        return !!routingAnswers.hasInfidelity;
      case "children":
        return !!routingAnswers.youngestChildAge;
      case "income":
        // Income is optional
        return true;
      case "property":
        // Property is optional
        return true;
      case "halachic":
        return !!routingAnswers.halachicGrounds;
      case "result":
        // For specific claims, require at least one selection
        if (routingAnswers.situation === "specific") {
          return specificClaims.length > 0;
        }
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {renderStep()}

      {/* Navigation buttons */}
      <div className="flex justify-between items-center pt-4">
        {currentStep !== "situation" ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-neutral-dark hover:text-primary transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
            <span>חזרה</span>
          </button>
        ) : (
          <div />
        )}

        {currentStep === "result" ? (
          <button
            type="button"
            onClick={handleComplete}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
          >
            <span>המשך לשאלון</span>
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors",
              canProceed()
                ? "bg-primary text-white hover:bg-primary-dark"
                : "bg-neutral-light text-neutral cursor-not-allowed"
            )}
          >
            <span>המשך</span>
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
