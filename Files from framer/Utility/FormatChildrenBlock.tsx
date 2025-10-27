export function formatChildrenBlock(formData) {
    const childrenArr = formData.children?.length
        ? formData.children
        : formData.childrenSimple?.length
          ? formData.childrenSimple
          : []
    if (!childrenArr.length) return "אין"

    return childrenArr
        .map(
            (child, idx) =>
                `שם: ${child.firstName || ""} ${child.lastName || ""} | ` +
                `תאריך לידה: ${child.birthDate || ""} | ` +
                `מקום מגורי הילד: ${child.address || ""} | ` +
                `שם ההורה (שאינו המבקש): ${child.nameOfParent || ""}`
        )
        .join("<br><br>")
}
