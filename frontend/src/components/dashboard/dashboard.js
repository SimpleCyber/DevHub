import { Sidebar } from "../sidebar/sidebar";
import { useSidebar } from "../context/SidebarContext";
import UserData from "./userdata";

const Internships = () => {
  const { isOpen } = useSidebar();

  return (
    <div className="flex bg-[#e9effe] min-h-screen">
      <Sidebar />
      <div
        className="flex-1 overflow-auto bg-blue-50 mt-14 sm:mt-0 transition-all duration-300"
        style={{ marginLeft: isOpen ? "256px" : "64px" }}
      >
        <UserData />
      </div>
    </div>
  );
};

export default Internships;
