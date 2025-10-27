import React from "react"

export function PaymentStep({
    basicInfo,
    selectedClaims,
    formData,
    paymentData,
    setPaymentData,
    onNext,
    onBack,
}) {
    // You can add more summary info if needed
    return (
        <div
            style={{
                maxWidth: 420,
                margin: "0 auto",
                padding: 32,
                textAlign: "center",
            }}
        >
            <h2 style={{ fontSize: 24, marginBottom: 24 }}>סיכום ותשלום</h2>
            <div style={{ marginBottom: 24 }}>
                <div>
                    <strong>שם התובע:</strong> {basicInfo.fullName}
                </div>
                <div>
                    <strong>סוגי תביעה:</strong>{" "}
                    {selectedClaims.map((key) => (
                        <span key={key}>{key} </span>
                    ))}
                </div>
                {/* You can add more fields here */}
            </div>
            <button
                className="next-btn"
                style={{
                    background: "#019FB7",
                    color: "#EEF2F3",
                    border: "0.5px solid #018DA2",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 500,
                    lineHeight: "1.2em",
                    fontSize: 18,
                    padding: "16px 32px",
                    marginBottom: 16,
                }}
                onClick={() => {
                    // Fake payment - just flag payment complete and continue
                    setPaymentData({ paid: true, date: new Date() })
                    onNext()
                }}
            >
                שלם {selectedClaims.length * 3900} ₪
            </button>
            <div>
                <button
                    onClick={onBack}
                    style={{
                        marginTop: 16,
                        background: "transparent",
                        border: "none",
                        color: "#019FB7",
                        fontWeight: 500,
                        cursor: "pointer",
                        fontSize: 16,
                        textDecoration: "underline",
                    }}
                >
                    חזרה
                </button>
            </div>
        </div>
    )
}
