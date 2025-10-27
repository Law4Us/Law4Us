import * as React from "react"
import StepIndicator from "./WizardMenu"

export default function WizardHeader({
    step,
    setStep,
    maxReachedStep,
}: {
    step: number
    setStep: (n: number) => void
    maxReachedStep: number
}) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 64,
                alignItems: "start",
                fontFamily: "'Assistant', Arial, sans-serif",
                padding: "64px 0px 96px 0px",
            }}
            className="wizard-header"
        >
            <style>
                {`
                    @media (max-width: 809px) {
                        .wizard-header {
                            display: flex !important;
                            flex-direction: column-reverse !important;
                            gap: 32px !important;
                            align-items: flex-end !important;
                            text-align: right !important;
                            padding: 32px 0px 32px 0px !important;
                        }
                        
                        .wizard-header-content {
                            text-align: right !important;
                            align-items: end !important;
                        }
                        
                        .wizard-header-title {
                            font-size: 32px !important;
                            max-width: 100% !important;
                            line-height: 1.1em !important;
                        }
                        
                        .wizard-header-subtitle {
                            max-width: 100% !important;
                            font-size: 18px !important;
                            line-height: 1.3em !important;
                            margin-top: 16px !important;
                        }
                    }
                `}
            </style>

            {/* LEFT – Step bubbles */}
            <StepIndicator
                step={step}
                setStep={setStep}
                maxReachedStep={maxReachedStep}
            />

            {/* RIGHT – Hero title & subtitle */}
            <div
                className="wizard-header-content"
                style={{
                    textAlign: "right",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "end",
                }}
            >
                <h1
                    className="wizard-header-title"
                    style={{
                        margin: 0,
                        fontSize: 48,
                        fontWeight: 700,
                        letterSpacing: "-0.04em",
                        maxWidth: "420px",
                        lineHeight: "1em",
                    }}
                >
                    ברוכים הבאים לתהליך גירושין און־ליין
                </h1>
                <p
                    className="wizard-header-subtitle"
                    dir="rtl"
                    style={{
                        fontSize: "20px",
                        lineHeight: "1em",
                        letterSpacing: "-0.04em",
                        fontWeight: 500,
                        maxWidth: "400px",
                    }}
                >
                    אנחנו שמחים שבחרתם להתחיל תהליך אונליין איתנו. מלאו את
                    הפרטים כדי להתחיל בתהליך.
                </p>
            </div>
        </div>
    )
}
