import { Sidebar } from "../sidebar/sidebar";
import { useSidebar } from "../context/SidebarContext";
import DataCollector from "./datacollector";

const Profile = () => {
  const { isOpen } = useSidebar();

  return (
    <div className="bg-[#e9effe] min-h-screen">
      <Sidebar />
      <div
        className="overflow-auto bg-blue-50 transition-all duration-300"
        style={{ marginLeft: isOpen ? "256px" : "64px" }}
      >
        <DataCollector />
      </div>
    </div>
  );
};

export default Profile;
