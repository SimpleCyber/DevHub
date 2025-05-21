import { Sidebar } from "../sidebar/sidebar"
import DataCollector from "./datacollector";

const Profile = () => {
  return (
    <div className="flex bg-[#e9effe]">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-blue-50">
        <DataCollector />
      </div>
    </div>
  )
}

export default Profile;