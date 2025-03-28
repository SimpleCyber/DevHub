import { Sidebar } from "../sidebar/sidebar"
import InternshipList from "./InternshipList"

const Internships = () => {
  return (
    <div className="flex bg-[#e9effe]">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <InternshipList />
      </div>
    </div>
  )
}

export default Internships;