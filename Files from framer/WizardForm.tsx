import * as React from "react"
import { useState } from "react"
import { ClaimPicker } from "./Wizard_Steps/ClaimPicker.tsx"
import { DynamicForm } from "./Wizard_Steps/DynamicForm.tsx"
import { PaymentStep } from "./Wizard_Steps/PaymentStep.tsx"
import SignDocuments from "./Wizard_Steps/SignDocuments.tsx"
import SendToMake from "./Wizard_Steps/SendToMake.tsx"
import { CLAIM_SCHEMAS } from "./ClaimSchemas.tsx"
import { sharedFields } from "./Input_Types/SharedFields.tsx"
import { formatChildrenBlock } from "./Utility/FormatChildrenBlock.tsx"
import WizardHeader from "./WizardHeader.tsx"

export const CLAIMS = [
    { key: "divorceAgreement", label: "הסכם גירושין", price: 3900 },
    { key: "divorce", label: "תביעת גירושין/כתב הגנה גירושין", price: 3900 },
    { key: "property", label: "תביעת/כתב הגנה רכושית", price: 3900 },
    { key: "custody", label: "תביעת/כתב הגנה משמורת", price: 3900 },
    { key: "alimony", label: "תביעת/כתב הגנה מזונות", price: 3900 },
]

export default function WizardForm() {
    const [step, setStep] = useState(0)
    // track furthest step the user has legitimately reached
    const [maxReachedStep, setMaxReachedStep] = useState(0)

    const [selectedClaims, setSelectedClaims] = useState<string[]>([])
    const [basicInfo, setBasicInfo] = useState<any>({
        fullName: "",
        idNumber: "",
        address: "",
        phone: "",
        email: "",
        birthDate: "",
        fullName2: "",
        idNumber2: "",
        address2: "",
        phone2: "",
        email2: "",
        birthDate2: "",
        weddingDay: "",
    })
    const [formData, setFormData] = useState<any>({})
    const [paymentData, setPaymentData] = useState<any>({})
    const [signature, setSignature] = useState<string>("")
    const [filledHtmls, setFilledHtmls] = useState<any>({})

    const questionsByClaim = selectedClaims.map((key) => ({
        key,
        label: CLAIMS.find((c) => c.key === key)?.label || key,
        questions: CLAIM_SCHEMAS[key] || [],
    }))

    const childrenBlock = formatChildrenBlock(formData)

    // helpers to move steps while updating maxReachedStep correctly
    const goTo = (n: number) => setStep(n)
    const next = (n: number) => {
        setStep(n)
        setMaxReachedStep((prev) => Math.max(prev, n))
    }
    const back = (n: number) => setStep(n)

    return (
        <div>
            <WizardHeader
                step={step}
                setStep={goTo}
                maxReachedStep={maxReachedStep}
            />

            {step === 0 && (
                <ClaimPicker
                    selectedClaims={selectedClaims}
                    setSelectedClaims={setSelectedClaims}
                    inputs={basicInfo}
                    setInputs={setBasicInfo}
                    onNext={() => next(1)}
                />
            )}

            {step === 1 && (
                <DynamicForm
                    questionsByClaim={questionsByClaim}
                    sharedFields={sharedFields}
                    formData={formData}
                    setFormData={setFormData}
                    basicInfo={basicInfo} // Pass basicInfo for name replacements
                    onNext={() => next(2)}
                    onBack={() => back(0)}
                />
            )}

            {step === 2 && (
                <SignDocuments
                    documentTypes={["powerOfAttorney", "form3"]}
                    templateData={{
                        ...basicInfo,
                        ...formData,
                        claimType: selectedClaims
                            .map(
                                (key) =>
                                    CLAIMS.find((c) => c.key === key)?.label
                            )
                            .join(", "),
                        date: new Date().toLocaleDateString("he-IL"),
                        childrenBlock,
                    }}
                    signature={signature}
                    setSignature={setSignature}
                    onNext={() => next(3)}
                    onBack={() => back(1)}
                    setFilledHtmls={setFilledHtmls}
                />
            )}

            {step === 3 && (
                <PaymentStep
                    basicInfo={basicInfo}
                    selectedClaims={selectedClaims}
                    formData={formData}
                    paymentData={paymentData}
                    setPaymentData={setPaymentData}
                    onNext={() => next(4)}
                    onBack={() => back(2)}
                />
            )}

            {step === 4 && (
                <SendToMake
                    allData={{
                        basicInfo,
                        formData,
                        selectedClaims,
                        paymentData,
                        signature,
                        childrenBlock,
                    }}
                    documentTypes={["powerOfAttorney", "form3"]}
                    onBack={() => back(3)}
                />
            )}
        </div>
    )
}
