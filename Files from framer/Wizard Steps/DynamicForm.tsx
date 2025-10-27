import * as React from "react"
import { NeedsTable } from "../Input_Types/NeedsTable.tsx"
import { globalQuestions } from "../GlobalQuestions.tsx"

/** Prefer crypto.randomUUID when available; fall back safely */
const uuid = () =>
    (globalThis.crypto?.randomUUID?.() as string) ||
    Math.random().toString(36).slice(2) + Date.now()

/** Hoist CSS so it isn't re-created on each render */
const STYLES = `
:root {
  --border-color: #E3E6E8;
}

/* === Layout helpers === */
.sub-grid{
  display:flex;
  flex-wrap:wrap;
  gap:16px 24px;
  width:100%;
  margin-top:16px;
  flex-direction: column;
}
.section-group{margin-bottom: 48px;}
.global-heading{flex:1 1 100%; margin-top:32px;}
.question-grid{display:flex;flex-wrap:wrap;gap:64px 32px;}
.row-flex{display:flex;flex-wrap:wrap;gap:16px 24px;align-items:flex-end;margin-bottom: 24px;}
.form-wrapper {width:100%;}
.section-label {margin-bottom: 12px;}

/* Make any block take the whole row */
.full-row{flex:1 1 100%; max-width:100%; width:100%;}

/* === Inputs === */
.form-input{
  color:#0C1719;font-weight:500;font-size:20px;line-height:1.1em;
  display:flex;flex-direction:column;gap:16px;
  flex: 1;
}
.form-input.full-width{flex:1 1 100%;}
.form-input input,
.form-input textarea,
.form-input select{
  color:#0C1719;background:#F9FAFB;font-weight:500;font-size:14px;
  border:1px solid var(--border-color);border-radius:6px;padding:12px 16px;
  font-family:'Assistant', Arial, sans-serif;
}
.form-input textarea{resize:vertical}
.form-input select{cursor:pointer;}

/* === Radio group (fieldset/legend "cut" border) === */
.radio-question{flex:1 1 300px;}
.radio-question.full-row{flex:1 1 100%;max-width:100%;}
.radio-question fieldset{
  border:1px solid var(--border-color);
  border-radius:8px;
  padding:12px 16px 16px 16px;
  margin:0;
  min-inline-size:0;
}
.radio-question legend{
  font-weight:600;
  font-size:18px;
  color:#0C1719;
  padding:0 8px;
}
.radio-row{display:flex;gap:16px;flex-wrap:wrap;margin-top:4px;}
.radio-row.column{flex-direction:column;}
.radio-option{display:flex;align-items:center;}
.radio-option input[type="radio"]{accent-color:#019FB7;border:none;}
.radio-option input[type="radio"]:checked + span{color:#019FB7;font-weight:600;}
.radio-option span{margin-inline-start:4px;font-size:18px;}
.radio-question .sub-grid{margin-top:16px}

/* === Repeater controls === */
.remove-btn{height:40px;padding:0 16px;background:#e8e8e8;border:none;border-radius:6px;cursor:pointer;}
.add-row-wrapper{display:flex;align-items:center;gap:8px;margin-top:8px;}
.icon-btn,
.remove-btn{
  width:40px;
  height:40px;
  border-radius:6px;
  background:#F9FAFB;
  color:#0C1719;
  border:1px solid var(--border-color);
  font-size:24px;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  line-height:1;
  padding-bottom: 2px;
  margin-bottom: 2px;
}

/* === Headings === */
.section-label{color:#0C1719;font-weight:600;font-size:24px;letter-spacing:-0.02em;}

/* === File-list remove === */
.remove-file-btn{margin-inline-start:8px;font-size:12px;background:#eee;border:none;border-radius:4px;cursor:pointer;}

/* === Nav buttons === */
.next-btn{margin-top:48px;padding:16px 32px;background:#019FB7;color:#EEF2F3;border:0.5px solid #018DA2;
          border-radius:6px;cursor:pointer;font-weight:500;font-size:18px;transition:background .2s;}
.next-btn:disabled{background:#b8d7dd;cursor:not-allowed;}

/* --- ילדים repeater basic 50/50 flex columns ---------------------- */
.children-wrapper .child-row{
  display:flex;
  flex-direction:row;
  flex-wrap:wrap;
  gap:32px;
  margin-bottom:16px;
  position:relative;
}
.children-wrapper .left-col,
.children-wrapper .right-col {
  flex:1;
  gap:24px;
}
.children-wrapper .right-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    order: 1;
}
.children-wrapper .left-col {
    order: 2;
}
.children-wrapper .left-col .form-input {
    height: 100%;
}
.children-wrapper .left-col textarea{
  flex:1 1 auto;  
  min-height:180px;
  resize: none;
}
.children-wrapper .child-row .remove-btn{
  position: absolute;
  width: 40px;
  height: 40px;
  left: 16px;
  bottom: -16px;
}
.remove-btn:disabled{
  opacity:0.4;
  cursor:not-allowed;
}

/* === Needs table (no background/card) — FLEX ROWS ================= */
.needs-block { width:100%; }
.needs-block table {
  width:100%;
  border-collapse:separate;
  border-spacing:0 8px;
  direction:rtl;
}
.needs-block thead th{
  text-align:right;
  font-family:'Assistant', Arial, sans-serif;
  font-weight:600;
  font-size:20px;
  color:#0C1719;
  padding:0 8px 4px 8px;
}

/* Make each row a flex container so columns share space evenly */
.needs-block tr { display:flex; gap:8px; }

/* All cells flex equally… */
.needs-block td,
.needs-block th { flex:1; padding:0 8px; align-items:center; }

/* …except the last cell (remove button) which is fixed width */
.needs-block td:last-child,
.needs-block th:last-child { flex:0 0 48px; padding:0; text-align:left; }

/* Inputs look like the rest and fill their cell */
.needs-block input[type="text"],
.needs-block input[type="number"]{
  font-family:'Assistant', Arial, sans-serif;
  font-weight:500;
  font-size:14px;
  color:#0C1719;
  background:#F9FAFB;
  border:1px solid var(--border-color);
  border-radius:6px;
  padding:12px 16px;
  width:100%;
  box-sizing:border-box;
}

/* === Mobile responsive for children block === */
@media (max-width: 809px) {
  .children-wrapper .child-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .children-wrapper .right-col {
    grid-template-columns: 1fr;
    order: 1;
  }
  
  .children-wrapper .left-col {
    order: 2;
  }
  
  .children-wrapper .child-row .remove-btn {
    position: static;
    align-self: center;
    margin-top: 16px;
  }
}
`

export function DynamicForm({
    questionsByClaim,
    sharedFields = {},
    formData,
    setFormData,
    onNext,
    onBack,
    basicInfo, // Add basicInfo prop to get names
}) {
    /*───────────────────────────────────────────────────────────────────────────
    CHILDREN-block logic
    ───────────────────────────────────────────────────────────────────────────*/
    const hasChildren = questionsByClaim.some((c) =>
        c.questions.some(
            (q) => q.type === "shared" && q.sharedKey === "children"
        )
    )
    const hasChildrenSimple = questionsByClaim.some((c) =>
        c.questions.some(
            (q) => q.type === "shared" && q.sharedKey === "childrenSimple"
        )
    )

    const renderChildrenKey = hasChildren
        ? "children"
        : hasChildrenSimple
          ? "childrenSimple"
          : null

    const filterQuestions = (qs) =>
        qs.filter(
            (q) =>
                q.type !== "shared" ||
                (q.sharedKey !== "children" &&
                    q.sharedKey !== "childrenSimple") ||
                q.sharedKey === renderChildrenKey
        )

    const renderedShared: Record<string, boolean> = {}

    // Helper function to replace dynamic names in text
    const replaceDynamicNames = (text: string, options?: any[]) => {
        if (!basicInfo) return text

        const applicantName = basicInfo.fullName || "המבקש/ת"
        const partnerName = basicInfo.fullName2 || "הנתבע/ת"

        // Handle special cases for housing options
        if (options && text === "בבעלות המבקש/ת") {
            return `בבעלות ${applicantName}`
        }
        if (options && text === "בבעלות הנתבע/ת") {
            return `בבעלות ${partnerName}`
        }

        return text
            .replace(
                /המבקש\/ת|המבקש|המבקשת|התובע\/ת|התובע|התובעת/g,
                applicantName
            )
            .replace(/הנתבע\/ת|הנתבע|הנתבעת|בן\/בת הזוג/g, partnerName)
            .replace(/אתה\/את|את\/ה/g, "אתה")
            .replace(/הבעל\/האישה|הבעל\/אישה/g, partnerName)
    }

    // Get dynamic name options for select fields
    const getDynamicNameOptions = () => {
        const options = []
        if (basicInfo?.fullName) {
            options.push({
                value: basicInfo.fullName,
                label: basicInfo.fullName,
            })
        }
        if (basicInfo?.fullName2) {
            options.push({
                value: basicInfo.fullName2,
                label: basicInfo.fullName2,
            })
        }
        if (basicInfo?.fullName && basicInfo?.fullName2) {
            options.push({
                value: `${basicInfo.fullName} ו-${basicInfo.fullName2}`,
                label: "שניהם",
            })
        }
        return options
    }

    // Get dynamic party options (just applicant and respondent, no "both")
    const getDynamicPartyOptions = () => {
        const options = []
        if (basicInfo?.fullName) {
            options.push({
                value: basicInfo.fullName,
                label: basicInfo.fullName,
            })
        }
        if (basicInfo?.fullName2) {
            options.push({
                value: basicInfo.fullName2,
                label: basicInfo.fullName2,
            })
        }
        return options
    }

    /*───────────────────────────────────────────────────────────────────────────
    Helpers
    ───────────────────────────────────────────────────────────────────────────*/
    const ensureAtLeastOneRow = (arr, fields) => {
        if (!arr || arr.length === 0) {
            const obj: any = { __id: uuid() }
            fields.forEach((f) => (obj[f.name] = ""))
            return [obj]
        }
        return arr.map((r) => (r && r.__id ? r : { ...r, __id: uuid() }))
    }

    const fieldId = (groupName: string, rowIdOrStatic: string, name: string) =>
        `${groupName}-${rowIdOrStatic}-${name}`

    /*───────────────────────────────────────────────────────────────────────────
    Repeater  (children + generic) — with stable initial rows to keep focus
    ───────────────────────────────────────────────────────────────────────────*/
    const renderRepeater = (q) => {
        const initialRows = React.useMemo(() => {
            const obj: any = { __id: uuid() }
            q.fields.forEach((f) => (obj[f.name] = ""))
            return [obj]
        }, [q.name])

        const getRows = (f) => {
            const arr = f[q.name]
            if (!arr || arr.length === 0) return initialRows
            return arr.map((r) => (r && r.__id ? r : { ...r, __id: uuid() }))
        }

        const rows = getRows(formData)

        const handleChange = (idx, name, value) =>
            setFormData((f) => {
                const cur = getRows(f)
                return {
                    ...f,
                    [q.name]: cur.map((row, i) =>
                        i === idx
                            ? { ...row, [name]: value, __id: row.__id }
                            : row
                    ),
                }
            })

        const addRow = () =>
            setFormData((f) => {
                const cur = getRows(f)
                return {
                    ...f,
                    [q.name]: [
                        ...cur,
                        Object.fromEntries([
                            ["__id", uuid()],
                            ...q.fields.map((fld) => [fld.name, ""]),
                        ]),
                    ],
                }
            })

        const removeRow = (idx) =>
            setFormData((f) => {
                const cur = getRows(f)
                const next = cur.filter((_, i) => i !== idx)
                return {
                    ...f,
                    [q.name]: next.length === 0 ? initialRows : next,
                }
            })

        const renderField = (f, rowObj, rowIdx) => {
            const id = fieldId(q.name, rowObj.__id, f.name)
            const t = f.type || "text"

            // Handle dynamic name select fields for property ownership
            if (
                f.useDynamicNames ||
                (f.type === "select" && f.name === "owner")
            ) {
                const options = getDynamicNameOptions()
                return (
                    <div
                        key={`${rowObj.__id}-${f.name}`}
                        className="form-input"
                    >
                        <label htmlFor={id}>
                            {replaceDynamicNames(f.label)}
                        </label>
                        <select
                            id={id}
                            value={rowObj[f.name] || ""}
                            onChange={(e) =>
                                handleChange(rowIdx, f.name, e.target.value)
                            }
                        >
                            <option value="">בחר...</option>
                            {options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )
            }

            // Handle dynamic party select (for protection order - no "both" option)
            if (f.useDynamicParties) {
                const options = getDynamicPartyOptions()
                return (
                    <div
                        key={`${rowObj.__id}-${f.name}`}
                        className="form-input"
                    >
                        <label htmlFor={id}>
                            {replaceDynamicNames(f.label)}
                        </label>
                        <select
                            id={id}
                            value={rowObj[f.name] || ""}
                            onChange={(e) =>
                                handleChange(rowIdx, f.name, e.target.value)
                            }
                        >
                            <option value="">בחר...</option>
                            {options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )
            }

            return (
                <div key={`${rowObj.__id}-${f.name}`} className="form-input">
                    <label htmlFor={id}>{replaceDynamicNames(f.label)}</label>

                    {t === "file" ? (
                        <input
                            id={id}
                            type="file"
                            accept={f.accept}
                            onChange={(e) =>
                                handleChange(rowIdx, f.name, e.target.files)
                            }
                        />
                    ) : t === "textarea" ? (
                        <textarea
                            id={id}
                            rows={f.maxRows || 3}
                            value={rowObj[f.name] || ""}
                            onChange={(e) =>
                                handleChange(rowIdx, f.name, e.target.value)
                            }
                        />
                    ) : t === "select" ? (
                        <select
                            id={id}
                            value={rowObj[f.name] || ""}
                            onChange={(e) =>
                                handleChange(rowIdx, f.name, e.target.value)
                            }
                        >
                            <option value="">בחר...</option>
                            {f.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            id={id}
                            type={t}
                            value={rowObj[f.name] || ""}
                            onChange={(e) =>
                                handleChange(rowIdx, f.name, e.target.value)
                            }
                            autoComplete="off"
                        />
                    )}
                </div>
            )
        }

        if (q.name === "children") {
            const [textAreaField, ...smallFields] = q.fields
            return (
                <div key="children" className="form-wrapper children-wrapper">
                    <h4 className="section-label">
                        {replaceDynamicNames(q.label)}
                    </h4>

                    {rows.map((row, idx) => (
                        <div key={row.__id} className="child-row">
                            <div className="left-col">
                                {renderField(textAreaField, row, idx)}
                            </div>
                            <div className="right-col">
                                {smallFields.map((f) =>
                                    renderField(f, row, idx)
                                )}
                            </div>
                            <button
                                type="button"
                                className="remove-btn"
                                onClick={() => removeRow(idx)}
                                disabled={rows.length === 1}
                                aria-disabled={rows.length === 1}
                                title={
                                    rows.length === 1
                                        ? "לא ניתן למחוק את השורה האחרונה"
                                        : "מחק שורה"
                                }
                            >
                                -
                            </button>
                        </div>
                    ))}

                    <div className="add-row-wrapper">
                        <button
                            type="button"
                            className="icon-btn"
                            onClick={addRow}
                            aria-label="הוסף שורה"
                        >
                            +
                        </button>
                        <span>אנא לחץ על מנת להוסיף עוד שורה</span>
                    </div>
                </div>
            )
        }

        return (
            <div key={q.name} className="form-wrapper">
                <h4 className="section-label">
                    {replaceDynamicNames(q.label)}
                </h4>

                {rows.map((row, idx) => (
                    <div key={row.__id} className="row-flex">
                        {q.fields.map((f) => renderField(f, row, idx))}
                        <button
                            type="button"
                            className="remove-btn"
                            onClick={() => removeRow(idx)}
                            disabled={rows.length === 1}
                            aria-disabled={rows.length === 1}
                            title={
                                rows.length === 1
                                    ? "לא ניתן למחוק את השורה האחרונה"
                                    : "מחק שורה"
                            }
                        >
                            -
                        </button>
                    </div>
                ))}

                <div className="add-row-wrapper">
                    <button
                        type="button"
                        className="icon-btn"
                        onClick={addRow}
                        aria-label="הוסף שורה"
                    >
                        +
                    </button>
                    <span>אנא לחץ על מנת להוסיף עוד שורה</span>
                </div>
            </div>
        )
    }

    /*───────────────────────────────────────────────────────────────────────────
    Needs-table — full row, no background
    ───────────────────────────────────────────────────────────────────────────*/
    const renderNeedsTable = (q) => (
        <div key={q.name} className="full-row">
            <h4 className="section-label">{replaceDynamicNames(q.label)}</h4>
            <div className="needs-block">
                <NeedsTable
                    value={formData[q.name] || []}
                    onChange={(val) =>
                        setFormData((f) => ({ ...f, [q.name]: val }))
                    }
                    childrenList={formData.children || []}
                />
            </div>
        </div>
    )

    /*───────────────────────────────────────────────────────────────────────────
    Radio (fieldset wraps radios + sub-questions)
    ───────────────────────────────────────────────────────────────────────────*/
    const renderRadio = (q) => {
        const stacked = q.options.length > 2
        const groupName = q.name

        return (
            <div key={q.name} className="form-input radio-question">
                <fieldset
                    role="radiogroup"
                    aria-labelledby={`${groupName}-legend`}
                >
                    <legend id={`${groupName}-legend`}>
                        {replaceDynamicNames(q.label)}
                    </legend>

                    <div className={"radio-row" + (stacked ? " column" : "")}>
                        {q.options.map((opt) => {
                            const id = `${groupName}-${opt.value}`
                            // Special handling for housing options
                            const displayLabel = replaceDynamicNames(
                                opt.label,
                                q.options
                            )
                            return (
                                <label
                                    key={opt.value}
                                    className="radio-option"
                                    htmlFor={id}
                                >
                                    <input
                                        id={id}
                                        type="radio"
                                        name={groupName}
                                        value={opt.value}
                                        checked={
                                            formData[groupName] === opt.value
                                        }
                                        onChange={() =>
                                            setFormData((f) => ({
                                                ...f,
                                                [groupName]: opt.value,
                                            }))
                                        }
                                    />
                                    <span>{displayLabel}</span>
                                </label>
                            )
                        })}
                    </div>

                    {q.options.map((opt) =>
                        formData[q.name] === opt.value && opt.fields ? (
                            <div key={opt.value + "_sub"} className="sub-grid">
                                {opt.fields.map((subQ) =>
                                    renderQuestion({
                                        ...subQ,
                                        name: `${q.name}_${opt.value}_${subQ.name}`,
                                    })
                                )}
                            </div>
                        ) : null
                    )}
                </fieldset>
            </div>
        )
    }

    /*───────────────────────────────────────────────────────────────────────────
    Simple fields
    ───────────────────────────────────────────────────────────────────────────*/
    const renderFile = (q) => {
        const id = fieldId(q.name, "single", "file")
        return (
            <div key={q.name} className="form-input">
                <label htmlFor={id}>{replaceDynamicNames(q.label)}</label>
                <input
                    id={id}
                    type="file"
                    accept={q.accept}
                    onChange={(e) =>
                        setFormData((f) => ({ ...f, [q.name]: e.target.files }))
                    }
                />
            </div>
        )
    }

    const renderTextarea = (q) => {
        const id = fieldId(q.name, "single", "textarea")
        return (
            <div key={q.name} className="form-input">
                <label htmlFor={id}>{replaceDynamicNames(q.label)}</label>
                <textarea
                    id={id}
                    rows={q.maxRows || 3}
                    value={formData[q.name] || ""}
                    onChange={(e) =>
                        setFormData((f) => ({ ...f, [q.name]: e.target.value }))
                    }
                />
            </div>
        )
    }

    const renderInput = (q) => {
        const id = fieldId(q.name, "single", "input")

        // Handle select fields with dynamic parties (for non-repeater contexts)
        if (q.type === "select" && q.useDynamicParties) {
            const options = getDynamicPartyOptions()
            return (
                <div key={q.name} className="form-input">
                    <label htmlFor={id}>{replaceDynamicNames(q.label)}</label>
                    <select
                        id={id}
                        value={formData[q.name] || ""}
                        onChange={(e) =>
                            setFormData((f) => ({
                                ...f,
                                [q.name]: e.target.value,
                            }))
                        }
                    >
                        <option value="">בחר...</option>
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            )
        }

        // Handle select fields with dynamic names (for non-repeater contexts)
        if (q.type === "select" && q.useDynamicNames) {
            const options = getDynamicNameOptions()
            return (
                <div key={q.name} className="form-input">
                    <label htmlFor={id}>{replaceDynamicNames(q.label)}</label>
                    <select
                        id={id}
                        value={formData[q.name] || ""}
                        onChange={(e) =>
                            setFormData((f) => ({
                                ...f,
                                [q.name]: e.target.value,
                            }))
                        }
                    >
                        <option value="">בחר...</option>
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            )
        }

        return (
            <div key={q.name} className="form-input">
                <label htmlFor={id}>{replaceDynamicNames(q.label)}</label>
                <input
                    id={id}
                    type={q.type || "text"}
                    value={formData[q.name] || ""}
                    onChange={(e) =>
                        setFormData((f) => ({ ...f, [q.name]: e.target.value }))
                    }
                    autoComplete="off"
                />
            </div>
        )
    }

    const renderFileList = (q) => {
        const id = fieldId(q.name, "single", "files")
        return (
            <div key={q.name} className="file-list form-input">
                <label htmlFor={id}>{replaceDynamicNames(q.label)}</label>
                {q.description && <p className="file-desc">{q.description}</p>}
                <input
                    id={id}
                    type="file"
                    multiple={q.multiple}
                    accept={q.accept}
                    onChange={(e) => {
                        const newFiles = Array.from(e.target.files || [])
                        setFormData((f) => ({
                            ...f,
                            [q.name]: (f[q.name] || []).concat(newFiles),
                        }))
                    }}
                />
                <ul>
                    {(formData[q.name] || []).map((file, idx) => (
                        <li key={idx}>
                            {file?.name || "קובץ חדש"}
                            <button
                                type="button"
                                className="remove-file-btn"
                                onClick={() =>
                                    setFormData((f) => ({
                                        ...f,
                                        [q.name]: f[q.name].filter(
                                            (_, i) => i !== idx
                                        ),
                                    }))
                                }
                            >
                                הסר
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    /*───────────────────────────────────────────────────────────────────────────
    Dispatcher
    ───────────────────────────────────────────────────────────────────────────*/
    const renderQuestion = (q) => {
        if (q.type === "heading") {
            return (
                <h3 key={q.label} className="global-heading section-label">
                    {replaceDynamicNames(q.label)}
                </h3>
            )
        }

        if (
            q.type === "shared" &&
            (q.sharedKey === "children" || q.sharedKey === "childrenSimple") &&
            (sharedFields.children || sharedFields.childrenSimple)
        ) {
            if (renderedShared.children) return null
            renderedShared.children = true

            const modifiedFields =
                q.sharedKey === "children"
                    ? sharedFields.children.map((f) => ({
                          ...f,
                          label: replaceDynamicNames(f.label),
                      }))
                    : sharedFields.childrenSimple.map((f) => ({
                          ...f,
                          label: replaceDynamicNames(f.label),
                      }))

            return renderRepeater({
                label:
                    replaceDynamicNames(q.label) ||
                    (q.sharedKey === "children" ? "ילדים" : "ילדים (פשוט)"),
                name: "children",
                fields: modifiedFields,
            })
        }

        if (q.type === "needsTable") {
            return renderNeedsTable(q)
        }

        if (q.type === "shared" && q.sharedKey && sharedFields[q.sharedKey]) {
            if (renderedShared[q.sharedKey]) return null
            renderedShared[q.sharedKey] = true

            if (Array.isArray(sharedFields[q.sharedKey])) {
                return renderRepeater({
                    label: replaceDynamicNames(q.label) || "",
                    name: q.sharedKey,
                    fields: sharedFields[q.sharedKey],
                })
            }
            return renderQuestion({
                ...sharedFields[q.sharedKey],
                name: q.sharedKey,
            })
        }

        if (q.type === "repeater") return renderRepeater(q)
        if (q.type === "radio") return renderRadio(q)
        if (q.type === "file") return renderFile(q)
        if (q.type === "textarea") return renderTextarea(q)
        if (q.type === "fileList") return renderFileList(q)

        return renderInput(q)
    }

    function renderGlobalSections() {
        const groups: React.ReactNode[] = []
        let currentHeading: string | null = null
        let buffer: React.ReactNode[] = []

        const flush = () => {
            if (!currentHeading) return
            groups.push(
                <div key={currentHeading} className="section-group">
                    <h3 className="section-label">
                        {replaceDynamicNames(currentHeading)}
                    </h3>
                    <div className="question-grid">{buffer}</div>
                </div>
            )
            buffer = []
        }

        // Replace names in global questions
        const processedGlobalQuestions = globalQuestions.map((q) => ({
            ...q,
            label: replaceDynamicNames(q.label),
            options: q.options?.map((opt) => ({
                ...opt,
                label: replaceDynamicNames(opt.label),
                fields: opt.fields?.map((f) => ({
                    ...f,
                    label: replaceDynamicNames(f.label),
                })),
            })),
        }))

        processedGlobalQuestions.forEach((item) => {
            if (item.type === "heading") {
                flush()
                currentHeading = item.label
            } else {
                buffer.push(renderQuestion(item))
            }
        })

        flush()
        return groups
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                onNext()
            }}
            style={{
                direction: "rtl",
                fontFamily: "'Assistant', Arial, sans-serif",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <style>{STYLES}</style>

            {renderGlobalSections()}

            {questionsByClaim.map((claim) => (
                <React.Fragment key={claim.key}>
                    <h3 className="section-label" style={{ marginTop: 32 }}>
                        {claim.label}
                    </h3>
                    <div className="question-grid">
                        {filterQuestions(claim.questions).map(renderQuestion)}
                    </div>
                </React.Fragment>
            ))}

            <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
                <button
                    type="button"
                    className="next-btn"
                    style={{ background: "#aaa" }}
                    onClick={onBack}
                >
                    חזור
                </button>
                <button type="submit" className="next-btn">
                    הבא
                </button>
            </div>
        </form>
    )
}
