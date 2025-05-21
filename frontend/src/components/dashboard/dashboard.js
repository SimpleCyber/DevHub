import { Sidebar } from "../sidebar/sidebar"
import UserData from "./userdata";

const Internships = () => {
  return (
    <div className="flex bg-[#e9effe]">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-blue-50">
        <UserData />
      </div>
    </div>
  )
}

export default Internships;