// @ts-nocheck
import * as React from "react"
import { CLAIMS } from "../WizardForm"

// Now uses inputs and setInputs passed from parent!
export function ClaimPicker({
    selectedClaims,
    setSelectedClaims,
    inputs,
    setInputs,
    onNext,
}: any) {
    const handleInputChange = (e: any) => {
        const { id, value } = e.target
        setInputs((prev: any) => ({ ...prev, [id]: value }))
    }

    const toggleClaim = (key: any) => {
        setSelectedClaims((prev: any) =>
            prev.includes(key) ? prev.filter((c: any) => c !== key) : [...prev, key]
        )
    }

    // Don't require wedding date if not married
    const allFieldsFilled =
        inputs.relationshipType === "notMarried"
            ? Object.entries(inputs).every(([key, value]: [string, any]) =>
                  key === "weddingDay"
                      ? true
                      : value && value.toString().trim() !== ""
              ) && selectedClaims.length > 0
            : Object.values(inputs).every(
                  (v: any) => v && v.toString().trim() !== ""
              ) && selectedClaims.length > 0

    return (
        <div dir="rtl" style={{ fontFamily: "'Assistant', Arial, sans-serif" }}>
            <style>
                {`
                    .next-btn {
                        margin-top: 48px;
                        padding: 16px 32px;
                        background: #019FB7;
                        color: #EEF2F3;
                        border: 0.5px solid #018DA2;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                        line-height: 1.2em;
                        font-size: 18px;
                    }
                    .next-btn:disabled {
                        background: #b8d7dd;
                        cursor: not-allowed;
                    }
                    .form-row {
                        display:flex;
                        flex-direction: column;
                        gap:32px;
                        width:100%;
                    }
                    .title-form {
                        color: #0C1719;
                        font-weight: 600;
                        line-height: 1.1em;
                        font-size: 24px;
                        letter-spacing: -0.02em;
                    }
                    .form-input {
                        color: #0C1719;
                        font-weight: 500;
                        line-height: 1.1em;
                        font-size: 20px;
                        letter-spacing: -0.02em;
                        display:flex;
                        flex-direction:column;
                        gap:16px
                    }
                    .form-input input,
                    .form-input select {
                        color:#0C1719;
                        line-height: 1.1em;
                        font-weight: 500;
                        font-size: 14px;
                        letter-spacing: -0.02em;
                        border-radius: 8px;
                        background: #F9FAFB;
                        padding: 12px 16px;
                        outline: none;
                        border: 1px solid #E3E6E8;
                        font-family: 'Assistant', Arial, sans-serif;
                    }
                    .form-input input::placeholder {
                        color:#0C1719;
                        opacity: .4;
                        font-weight: 400;
                        line-height: 1.1em;
                        font-size: 14px;
                        letter-spacing: -0.02em;
                    }
                    .form-input select {
                        cursor: pointer;
                    }
                    .form-wrapper {
                        display:flex;
                        width: 100%;
                        gap:80px;
                    }
                    .form-picks {
                        gap:8px;
                        display:flex;
                        flex-direction:row;
                        flex-wrap:wrap;
                    }
                    .relationship-row {
                        display: flex;
                        gap: 24px;
                        align-items: flex-start;
                    }
                    .relationship-row .form-input {
                        flex: 1;
                    }

                    /* Responsive styles */
                    .claims-section {
                        display: none;
                    }

                    @media (max-width: 1199px) {
                        .form-wrapper {
                            gap: 40px;
                        }
                        .form-wrapper .form-row:last-child {
                            display: none;
                        }
                        .form-wrapper::after {
                            content: '';
                            flex: 1;
                        }
                        .claims-section {
                            display: block;
                            margin-top: 32px;
                        }
                    }

                    @media (max-width: 809px) {
                        .form-wrapper {
                            flex-direction: column;
                            gap: 32px;
                        }
                        .form-wrapper::after {
                            display: none;
                        }
                        .form-wrapper .form-row:last-child {
                            display: flex;
                        }
                        .claims-section {
                            display: none;
                        }
                        .relationship-row {
                            flex-direction: column;
                            gap: 16px;
                        }
                    }
                `}
            </style>
            <div className="form-wrapper">
                <div className="form-row">
                    <p className="title-form">תובע/בעל/אישה:</p>
                    <div className="form-input">
                        <label htmlFor="fullName">שם פרטי ומשפחה</label>
                        <input
                            id="fullName"
                            type="text"
                            placeholder="הקלידו כאן שם מלא"
                            value={inputs.fullName}
                            onChange={handleInputChange}
                            autoComplete="name"
                        />
                    </div>
                    <div className="form-input">
                        <label htmlFor="idNumber">תעודת זהות</label>
                        <input
                            id="idNumber"
                            type="text"
                            placeholder="הקלידו כאן ת.ז"
                            value={inputs.idNumber}
                            onChange={handleInputChange}
                            autoComplete="off"
                        />
                    </div>
                    <div className="form-input">
                        <label htmlFor="address">כתובת</label>
                        <input
                            id="address"
                            type="text"
                            placeholder="הקלידו כאן כתובת"
                            value={inputs.address}
                            onChange={handleInputChange}
                            autoComplete="street-address"
                        />
                    </div>
                    <div className="form-input">
                        <label htmlFor="phone">טלפון</label>
                        <input
                            id="phone"
                            type="tel"
                            dir="rtl"
                            placeholder="הקלידו כאן טלפון"
                            value={inputs.phone}
                            onChange={handleInputChange}
                            autoComplete="tel"
                        />
                    </div>
                    <div className="form-input">
                        <label htmlFor="email">כתובת מייל</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="הקלידו כאן מייל"
                            value={inputs.email}
                            onChange={handleInputChange}
                            autoComplete="email"
                        />
                    </div>
                    <div className="form-input">
                        <label htmlFor="birthDate">תאריך לידה</label>
                        <input
                            id="birthDate"
                            type="date"
                            placeholder="הקלידו כאן תאריך לידה"
                            value={inputs.birthDate}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="form-row">
                    <p className="title-form">נתבע/בעל/אישה:</p>
                    <div className="form-input">
                        <label htmlFor="fullName2">שם פרטי ומשפחה</label>
                        <input
                            id="fullName2"
                            type="text"
                            placeholder="הקלידו כאן שם מלא"
                            value={inputs.fullName2}
                            onChange={handleInputChange}
                            autoComplete="name"
                        />
                    </div>
                    <div className="form-input">
                        <label htmlFor="idNumber2">תעודת זהות</label>
                        <input
                            id="idNumber2"
                            type="text"
                            placeholder="הקלידו כאן ת.ז"
                            value={inputs.idNumber2}
                            onChange={handleInputChange}
                            autoComplete="off"
                        />
                    </div>
                    <div className="form-input">
                        <label htmlFor="address2">כתובת</label>
                        <input
                            id="address2"
                            type="text"
                            placeholder="הקלידו כאן כתובת"
                            value={inputs.address2}
                            onChange={handleInputChange}
                            autoComplete="street-address"
                        />
                    </div>
                    <div className="form-input">
                        <label htmlFor="phone2">טלפון</label>
                        <input
                            id="phone2"
                            type="tel"
                            dir="rtl"
                            placeholder="הקלידו כאן טלפון"
                            value={inputs.phone2}
                            onChange={handleInputChange}
                            autoComplete="tel"
                        />
                    </div>
                    <div className="form-input">
                        <label htmlFor="email2">כתובת מייל</label>
                        <input
                            id="email2"
                            type="email"
                            placeholder="הקלידו כאן מייל"
                            value={inputs.email2}
                            onChange={handleInputChange}
                            autoComplete="email"
                        />
                    </div>
                    <div className="form-input">
                        <label htmlFor="birthDate2">תאריך לידה</label>
                        <input
                            id="birthDate2"
                            type="date"
                            placeholder="הקלידו כאן תאריך לידה"
                            value={inputs.birthDate2}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="form-row">
                    <p className="title-form">עליכם</p>
                    <div className="relationship-row">
                        <div className="form-input">
                            <label htmlFor="relationshipType">סטטוס זוגי</label>
                            <select
                                id="relationshipType"
                                value={inputs.relationshipType || "married"}
                                onChange={handleInputChange}
                            >
                                <option value="married">נשואים</option>
                                <option value="commonLaw">ידועים בציבור</option>
                                <option value="separated">גרושים/פרודים</option>
                                <option value="notMarried">לא נשואים</option>
                            </select>
                        </div>
                        {inputs.relationshipType !== "notMarried" && (
                            <div className="form-input">
                                <label htmlFor="weddingDay">
                                    תאריך נישואין
                                </label>
                                <input
                                    id="weddingDay"
                                    type="date"
                                    value={inputs.weddingDay}
                                    onChange={handleInputChange}
                                />
                            </div>
                        )}
                    </div>
                    <div className="form-picks">
                        {CLAIMS.map((claim) => (
                            <button
                                key={claim.key}
                                onClick={() => toggleClaim(claim.key)}
                                style={{
                                    background: selectedClaims.includes(
                                        claim.key
                                    )
                                        ? "#F9FAFB"
                                        : "#EDF2F3",
                                    border: selectedClaims.includes(claim.key)
                                        ? "2px solid #019FB7"
                                        : "2px solid transparent",
                                    color: "#0C1719",
                                    fontWeight: 500,
                                    lineHeight: 1.1,
                                    fontSize: 20,
                                    fontFamily:
                                        "'Assistant', Arial, sans-serif",
                                    letterSpacing: "-0.02em",
                                    padding: "16px",
                                    borderRadius: 12,
                                    cursor: "pointer",
                                    boxShadow:
                                        "0 1px 5px -4px rgba(19,22,22,0.7) inset, 0 0 0 1px rgba(34,50,53,0.08), 0 4px 8px 0 rgba(34,50,53,0.05)",
                                    width: "fit-content",
                                    display: "flex",
                                    flexWrap: "wrap",
                                }}
                            >
                                {claim.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Claims section for tablet view */}
            <div className="claims-section">
                <div className="form-row">
                    <p className="title-form">עליכם</p>
                    <div className="relationship-row">
                        <div className="form-input">
                            <label htmlFor="relationshipType">סטטוס זוגי</label>
                            <select
                                id="relationshipType"
                                value={inputs.relationshipType || "married"}
                                onChange={handleInputChange}
                            >
                                <option value="married">נשואים</option>
                                <option value="commonLaw">ידועים בציבור</option>
                                <option value="separated">גרושים/פרודים</option>
                                <option value="notMarried">לא נשואים</option>
                            </select>
                        </div>
                        {inputs.relationshipType !== "notMarried" && (
                            <div className="form-input">
                                <label htmlFor="weddingDay">
                                    תאריך נישואין
                                </label>
                                <input
                                    id="weddingDay"
                                    type="date"
                                    value={inputs.weddingDay}
                                    onChange={handleInputChange}
                                />
                            </div>
                        )}
                    </div>
                    <div className="form-picks">
                        {CLAIMS.map((claim) => (
                            <button
                                key={claim.key}
                                onClick={() => toggleClaim(claim.key)}
                                style={{
                                    background: selectedClaims.includes(
                                        claim.key
                                    )
                                        ? "#F9FAFB"
                                        : "#EDF2F3",
                                    border: selectedClaims.includes(claim.key)
                                        ? "2px solid #019FB7"
                                        : "2px solid transparent",
                                    color: "#0C1719",
                                    fontWeight: 500,
                                    lineHeight: 1.1,
                                    fontSize: 20,
                                    fontFamily:
                                        "'Assistant', Arial, sans-serif",
                                    letterSpacing: "-0.02em",
                                    padding: "16px",
                                    borderRadius: 12,
                                    cursor: "pointer",
                                    boxShadow:
                                        "0 1px 5px -4px rgba(19,22,22,0.7) inset, 0 0 0 1px rgba(34,50,53,0.08), 0 4px 8px 0 rgba(34,50,53,0.05)",
                                    width: "fit-content",
                                    display: "flex",
                                    flexWrap: "wrap",
                                }}
                            >
                                {claim.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <button
                    onClick={() => onNext(inputs)}
                    disabled={!allFieldsFilled}
                    className="next-btn"
                >
                    המשך לשלב הבא
                </button>
            </div>
        </div>
    )
}
