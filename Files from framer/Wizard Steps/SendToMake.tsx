// @ts-nocheck
import React from "react"
import { CLAIMS } from "../WizardForm" // Update path if needed!

export default function SendToMake({
    allData, // All your data from previous steps (user info, filledHtmls, signature, etc.)
    documentTypes, // ["powerOfAttorney", "form3", ...]
    onBack,
}) {
    const MAKE_WEBHOOK_URL =
        "https://hook.eu2.make.com/hi680vh8a9wrm9ctgpc6jjj6dlcht1fb"

    // Translate selectedClaims to Hebrew labels
    const selectedClaimsLabels =
        allData.selectedClaims?.map(
            (key) => CLAIMS.find((c) => c.key === key)?.label || key
        ) || []

    async function sendAllToMake() {
        try {
            const dataForMake = {
                ...allData,
                signatureBase64: allData.signature
                    ? allData.signature.replace(/^data:image\/png;base64,/, "")
                    : "",
                selectedClaimsLabels, // Send both keys and labels!
            }
            const res = await fetch(MAKE_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataForMake),
            })
            if (!res.ok) throw new Error("שליחה ל-Make נכשלה")
            alert("כל הנתונים נשלחו ל-Make!")
        } catch (e) {
            alert(e.message || "שגיאה בשליחה ל-Make")
        }
    }

    return (
        <div>
            <h2>המסמכים שלך מוכנים לשליחה</h2>
            {documentTypes.map((type) => (
                <div key={type} style={{ marginBottom: 20 }}>
                    <h3>{type}</h3>
                    <pre style={{ whiteSpace: "pre-wrap", direction: "rtl" }}>
                        {allData.filledHtmls?.[type]
                            ? allData.filledHtmls[type].replace(
                                  "___SIGNATURE___",
                                  allData.signature ? "[חתימה]" : "[חתימה חסרה]"
                              )
                            : ""}
                    </pre>
                </div>
            ))}
            <button onClick={sendAllToMake}>שלח את הכל ל-Make</button>
            <button onClick={onBack} style={{ marginRight: 8 }}>
                חזור
            </button>
        </div>
    )
}
