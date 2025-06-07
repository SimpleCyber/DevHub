import { Sidebar } from "../sidebar/sidebar"
import InternshipDetail from "./InternshipDetail";

const InternshipsDetail2 = () => {
  return (
    <div className="flex bg-[#e9effe]">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-blue-50 mt-14 sm:mt-0">
        <InternshipDetail />
      </div>
    </div>
  )
}

export default InternshipsDetail2;