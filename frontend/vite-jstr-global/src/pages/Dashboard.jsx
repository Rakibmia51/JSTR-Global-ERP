import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"


const Dashboard = () => {
  return (
    <div>
       <div className="flex">
         <Sidebar/>

        <div className="flex-1 p-6 bg-gray-50 min-h-screen">
            <Outlet/>
        </div>
       </div>
    </div>
  )
}

export default Dashboard