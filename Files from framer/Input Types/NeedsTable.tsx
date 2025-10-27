import * as React from "react"

type Need = { name: string; amounts: string[] }

export function NeedsTable({
    value,
    onChange,
    childrenList,
}: {
    value: Need[]
    onChange: (v: Need[]) => void
    childrenList: Array<{ firstName: string; lastName: string }>
}) {
    // Ensure defaults + keep columns in sync with children count
    React.useEffect(() => {
        if (!value || value.length === 0) {
            const defaults: Need[] = [
                {
                    name: "מזון וכלכלה",
                    amounts: Array(childrenList.length).fill(""),
                },
                {
                    name: "ביגוד והנעלה",
                    amounts: Array(childrenList.length).fill(""),
                },
            ]
            onChange(defaults)
        } else if (
            value.some((n) => n.amounts.length !== childrenList.length)
        ) {
            const fixed = value.map((need) => ({
                ...need,
                amounts: [
                    ...need.amounts.slice(0, childrenList.length),
                    ...Array(
                        Math.max(childrenList.length - need.amounts.length, 0)
                    ).fill(""),
                ],
            }))
            onChange(fixed)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [childrenList.length])

    const needs = value || []

    const addNeed = () =>
        onChange([
            ...needs,
            { name: "", amounts: Array(childrenList.length).fill("") },
        ])

    const updateNeed = (rowIdx: number, colIdx: number, val: string) => {
        onChange(
            needs.map((need, i) =>
                i === rowIdx
                    ? {
                          ...need,
                          amounts:
                              colIdx === -1
                                  ? need.amounts
                                  : need.amounts.map((amt, j) =>
                                        j === colIdx ? val : amt
                                    ),
                          name: colIdx === -1 ? val : need.name,
                      }
                    : need
            )
        )
    }

    const removeNeed = (idx: number) =>
        onChange(needs.filter((_, i) => i !== idx))

    const totals = childrenList.map((_, colIdx) =>
        needs.reduce((sum, need) => sum + (+need.amounts[colIdx] || 0), 0)
    )

    return (
        <div className="needs-table" style={{ width: "100%" }}>
            {/* Scoped styles so we don’t touch other parts */}
            <style>{`
        .needs-table {
          margin-top: 8px;
        }
        .needs-table table{
          width: 100%;
          border-collapse: separate;   /* so we can space rows */
          border-spacing: 0 8px;       /* vertical space between rows */
          direction: rtl;
        }
        .needs-table thead th{
          text-align: right;
          font-family: 'Assistant', Arial, sans-serif;
          font-weight: 600;
          font-size: 20px;
          color:#0C1719;
          padding: 0 8px 4px 8px;
        }
        .needs-table tbody td,
        .needs-table tfoot td{
          padding: 0 8px;
          vertical-align: middle;
        }

        /* Inputs match your form look */
        .needs-table input[type="text"],
        .needs-table input[type="number"]{
          font-family: 'Assistant', Arial, sans-serif;
          font-weight: 500;
          font-size: 14px;
          color:#0C1719;
          background:#F9FAFB;
          border:1px solid #E3E6E8;
          border-radius:6px;
          padding:12px 16px;
          width: 100%;
          box-sizing: border-box;
        }

        /* Column sizing */
        .needs-table .name-cell{ min-width: 240px; }
        .needs-table .amount-cell{ width: 120px; }
        .needs-table .actions-cell{ width: 56px; text-align: left; }

        /* Make each data row look tidy without full card */
        .needs-table tbody tr td:first-child input { /* name field */ }
        .needs-table tfoot td{
          font-family: 'Assistant', Arial, sans-serif;
          font-weight: 600;
          color:#0C1719;
          padding-top: 4px;
        }

        /* Button row (add) */
        .needs-table .add-row{
          display:flex;
          align-items:center;
          gap: 8px;
          margin-top: 8px;
        }
      `}</style>

            <div style={{ overflowX: "auto" }}>
                <table>
                    <thead>
                        <tr>
                            <th className="name-cell">צורך</th>
                            {childrenList.map((c, idx) => (
                                <th key={idx} className="amount-cell">
                                    {c.firstName + " " + c.lastName}
                                </th>
                            ))}
                            <th className="actions-cell"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {needs.map((need, rowIdx) => (
                            <tr key={rowIdx}>
                                <td className="name-cell">
                                    <label
                                        htmlFor={`needName_${rowIdx}`}
                                        style={{ display: "none" }}
                                    >
                                        צורך
                                    </label>
                                    <input
                                        id={`needName_${rowIdx}`}
                                        name={`needName_${rowIdx}`}
                                        type="text"
                                        value={need.name}
                                        onChange={(e) =>
                                            updateNeed(
                                                rowIdx,
                                                -1,
                                                e.target.value
                                            )
                                        }
                                    />
                                </td>

                                {need.amounts.map((amt, colIdx) => (
                                    <td key={colIdx} className="amount-cell">
                                        <label
                                            htmlFor={`needAmount_${rowIdx}_${colIdx}`}
                                            style={{ display: "none" }}
                                        >
                                            סכום
                                        </label>
                                        <input
                                            id={`needAmount_${rowIdx}_${colIdx}`}
                                            name={`needAmount_${rowIdx}_${colIdx}`}
                                            type="number"
                                            value={amt}
                                            onChange={(e) =>
                                                updateNeed(
                                                    rowIdx,
                                                    colIdx,
                                                    e.target.value
                                                )
                                            }
                                            inputMode="numeric"
                                        />
                                    </td>
                                ))}

                                <td className="actions-cell">
                                    {/* Your minus button style from the form */}
                                    <button
                                        type="button"
                                        className="remove-btn"
                                        onClick={() => removeNeed(rowIdx)}
                                        aria-label="הסר צורך"
                                        title="הסר צורך"
                                    >
                                        –
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                    <tfoot>
                        <tr>
                            <td>סה"כ</td>
                            {totals.map((t, idx) => (
                                <td key={idx} className="amount-cell">
                                    <b>{t}</b>
                                </td>
                            ))}
                            <td className="actions-cell"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Add row — reuse your icon-btn + copy */}
            <div className="add-row">
                <button
                    type="button"
                    className="icon-btn"
                    onClick={addNeed}
                    aria-label="הוסף צורך"
                >
                    +
                </button>
                <span
                    style={{
                        fontFamily: "'Assistant', Arial, sans-serif",
                        fontWeight: 500,
                    }}
                >
                    הוסף עוד צורך
                </span>
            </div>
        </div>
    )
}
