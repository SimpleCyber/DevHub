import { Sidebar } from "../sidebar/sidebar";
import { useSidebar } from "../context/SidebarContext";
import InternshipList from "./InternshipList";

const Internships = () => {
  const { isOpen } = useSidebar();

  return (
    <div className="bg-[#e9effe] min-h-screen">
      <Sidebar />
      <div
        className="overflow-auto bg-blue-50 min-h-screen transition-all duration-300"
        style={{ marginLeft: isOpen ? "256px" : "64px" }}
      >
        <InternshipList />
      </div>
    </div>
  );
};

export default Internships;
