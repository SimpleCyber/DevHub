import { Sidebar } from "../sidebar/sidebar"
import InternshipList from "./InternshipList"

const Internships = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <InternshipList />
      </div>
    </div>
  )
}

export default Internships;