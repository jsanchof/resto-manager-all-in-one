import { Outlet } from "react-router-dom"

export default function LayoutKitchen() {
    return (
        <div className="kitchen-layout"  style={{ backgroundColor: "#f4f7fb" }}>
            <Outlet />
        </div>
    )
}
