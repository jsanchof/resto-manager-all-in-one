import { Outlet } from "react-router-dom"
import Navbar from "../components/user/Navbar"
import Sidebar from "../components/user/Sidebar"
import { PlusCircle, ClipboardList } from "lucide-react"

const navigation = [
    {
        name: "Create Order",
        href: "/client/create-order",
        icon: PlusCircle
    },
    {
        name: "My Orders",
        href: "/client/my-orders",
        icon: ClipboardList
    }
];

export default function LayoutClient() {
    console.log("Ejecutando LayoutClient")
    return (
        <div className="app-container">
            <Navbar />
            <div className="d-flex flex-grow-1">
                <Sidebar />
                <main className="content-area p-3 flex-grow-1" style={{ backgroundColor: "#f4f7fb" }}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}






