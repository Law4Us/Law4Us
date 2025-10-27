// @ts-nocheck
import * as React from "react"
import { powerOfAttorneyTemplate } from "../Legal Templates/PowerOfAttorneyTemplate"
import { form3Template } from "../Legal Templates/Form3Template"

export function fillTemplate(template, values) {
    return template.replace(/{{\s*([\w]+)\s*}}/g, (_, key) => values[key] ?? "")
}

const TEMPLATE_STRINGS = {
    powerOfAttorney: powerOfAttorneyTemplate,
    form3: form3Template,
}

const TEMPLATE_TITLES = {
    powerOfAttorney: "ייפוי כוח",
    form3: "טופס 3 - הרצאת פרטים",
}

declare global {
    interface Window {
        SignaturePad: any
    }
}

export default function SignDocuments({
    documentTypes = ["powerOfAttorney"],
    templateData = {},
    signature,
    setSignature,
    setFilledHtmls,
    onNext,
    onBack,
}) {
    const canvasRef = React.useRef(null)
    const signaturePadRef = React.useRef(null)
    const [sigError, setSigError] = React.useState(null)

    // Load SignaturePad script
    React.useEffect(() => {
        const loadSigPad = () => {
            if (canvasRef.current && !signaturePadRef.current) {
                signaturePadRef.current = new window.SignaturePad(
                    canvasRef.current,
                    {
                        penColor: "#0C1719",
                        backgroundColor: "#ffffff00",
                    }
                )
            }
        }

        if (!window.SignaturePad) {
            const script = document.createElement("script")
            script.src =
                "https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js"
            script.async = true
            script.onload = loadSigPad
            document.body.appendChild(script)
        } else {
            loadSigPad()
        }
    }, [])

    const clearSignature = () => {
        signaturePadRef.current?.clear()
        setSignature("")
        setSigError(null)
    }

    const handleSign = () => {
        if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
            setSigError("יש לחתום לפני המשך")
            return
        }
        const sigData = signaturePadRef.current.toDataURL("image/png")
        setSignature(sigData)
        setSigError(null)

        // Fill for PDF: use text, not HTML!
        const plainTexts = {}
        documentTypes.forEach((type) => {
            const template = TEMPLATE_STRINGS[type]
            if (!template) return
            const filled = fillTemplate(template, {
                ...templateData,
                signature: "___SIGNATURE___",
            })

            plainTexts[type] = filled
        })
        console.log("HERE")
        console.log(plainTexts)
        setFilledHtmls(plainTexts)
    }

    // For preview, use signature image if present
    const renderedDocs = documentTypes.map((type) => {
        const rawTemplate = TEMPLATE_STRINGS[type]
        if (!rawTemplate) return null

        // For preview, signature as image or as placeholder
        const filled = fillTemplate(rawTemplate, {
            ...templateData,
            signature: signature
                ? `<div style="width:100%;text-align:right;margin:24px 0 0 0">
                    <img src="${signature}" style="width:160px;"/></div>`
                : "<div style='text-align:right;color:#888'>[חתימה]</div>",
        })

        return (
            <div
                key={type}
                className="filled-doc"
                style={{
                    flex: 1,
                    border: "1px solid #eee",
                    borderRadius: 8,
                    margin: 8,
                    background: "#f9fafb",
                    padding: 24,
                    minWidth: 320,
                    maxWidth: 500,
                }}
            >
                <h3 style={{ marginBottom: 16, color: "#019FB7" }}>
                    {TEMPLATE_TITLES[type] || type}
                </h3>
                <div
                    style={{
                        whiteSpace: "pre-line",
                        fontSize: 17,
                        direction: "rtl",
                    }}
                    // Only for preview, so html is fine
                    dangerouslySetInnerHTML={{ __html: filled }}
                />
            </div>
        )
    })

    return (
        <div
            style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: 32,
                direction: "rtl",
                fontFamily: "'Assistant', Arial, sans-serif",
            }}
        >
            <h2 style={{ marginBottom: 24 }}>חתימה על מסמכים</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                {renderedDocs}
            </div>
            {!signature ? (
                <div style={{ textAlign: "center", marginTop: 32 }}>
                    <p>אנא חתום כאן:</p>
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={150}
                        style={{
                            border: "1px solid #ccc",
                            background: "#fff",
                            borderRadius: 8,
                        }}
                    />
                    <div style={{ marginTop: 8 }}>
                        <button
                            onClick={clearSignature}
                            style={{ marginRight: 12 }}
                        >
                            נקה חתימה
                        </button>
                        <button onClick={handleSign}>חתום</button>
                    </div>
                    {sigError && <div style={{ color: "red" }}>{sigError}</div>}
                </div>
            ) : (
                <div style={{ textAlign: "center", marginTop: 32 }}>
                    <button onClick={onNext}>המשך</button>
                </div>
            )}
        </div>
    )
}
