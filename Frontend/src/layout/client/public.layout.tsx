import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div className="min-h-dvh">
      <Outlet />
    </div>
  );
};
export default PublicLayout;
