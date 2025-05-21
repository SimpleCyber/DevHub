import { Sidebar } from "../sidebar/sidebar"
import LearnCollector from "./LearnCollector";

const Learn = () => {
  return (
    <div className="flex bg-[#e9effe]">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-blue-50">
        <LearnCollector />
      </div>
    </div>
  )
}

export default Learn;