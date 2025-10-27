import * as React from "react"

const steps = [
    { label: "פרטים בסיסיים" },
    { label: "פרטים נוספים" },
    { label: "ייפוי כח" },
    { label: "תשלום" },
    { label: "קביעת פגישה" },
]

function CheckIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M20 6L9 17l-5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export default function StepIndicator({
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
                gridTemplateColumns: "1fr 1fr",
                gap: "36px 32px",
                maxWidth: 480,
                margin: "32px auto 24px",
            }}
        >
            {steps.map((s, i) => {
                const row = Math.floor(i / 2) + 1
                const col = i % 2 === 0 ? 2 : 1

                const isActive = i === step
                const isCompleted = i < step
                const isFuture = i > step

                const isReachable = i <= maxReachedStep // already reached at least once
                const isLockedFuture = i > maxReachedStep // not yet reached → lock

                const canClick = isReachable
                const handleClick = () => {
                    if (!canClick) return
                    setStep(i)
                }

                // Colors
                const circleBg = isActive || isCompleted ? "#019FB7" : "#E5E7EB"
                const numberColor = isActive ? "#EDF2F3" : "#515F61"
                const circleContentColor = isCompleted ? "#EDF2F3" : numberColor

                // Opacity rules
                const opacity = isCompleted ? 0.5 : isLockedFuture ? 0.7 : 1

                return (
                    <div
                        key={i}
                        onClick={handleClick}
                        aria-disabled={!canClick}
                        role="button"
                        tabIndex={canClick ? 0 : -1}
                        onKeyDown={(e) => {
                            if (
                                canClick &&
                                (e.key === "Enter" || e.key === " ")
                            ) {
                                e.preventDefault()
                                setStep(i)
                            }
                        }}
                        style={{
                            gridRow: row,
                            gridColumn: col,
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "20px",
                            direction: "rtl",
                            fontWeight: 500,
                            lineHeight: "1.3em",
                            letterSpacing: "-0.04em",
                            color: "#0C1719",
                            cursor: canClick ? "pointer" : "not-allowed",
                            pointerEvents: canClick ? "auto" : "none",
                            userSelect: "none",
                            opacity,
                        }}
                    >
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                background: circleBg,
                                color: circleContentColor,
                                fontWeight: 700,
                                fontSize: 20,
                                flexShrink: 0,
                            }}
                        >
                            {isCompleted ? (
                                <span
                                    aria-label="בוצע"
                                    title="בוצע"
                                    style={{ display: "inline-flex" }}
                                >
                                    <CheckIcon size={20} />
                                </span>
                            ) : (
                                (i + 1).toString().padStart(2, "0")
                            )}
                        </span>

                        <div>{s.label}</div>
                    </div>
                )
            })}
        </div>
    )
}
