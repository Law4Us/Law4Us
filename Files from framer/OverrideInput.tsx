import { forwardRef, type ComponentType } from "react"

export function withRTL(Component): ComponentType<any> {
    return forwardRef((props: any, ref) => {
        return (
            <Component
                ref={ref}
                {...props}
                style={{
                    ...(props.style || {}),
                    direction: "rtl",
                    textAlign: "right",
                }}
            />
        )
    })
}
