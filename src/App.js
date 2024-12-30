import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import UserTable from "./scenes/user";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar";
import LoginForm from "./scenes/login";
import SignupForm from "./scenes/signup";
import HardwareTable from "./scenes/hardware";
import ProjectTable from "./scenes/projects";
import ProjectManager from "./scenes/projectManager";
import AdminDashboard from "./scenes/adminDashboard";
import TestBox from "./scenes/textBox";
import ProjectChart from "./scenes/projectChart";
import LeftButton from "./components/SideButton";
import { ColorProvider } from "./components/ColorContext";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const location = useLocation();
  const [topbarColor, setTopbarColor] = useState("blue1000");

  const hideSidebarTopbar =
    location.pathname === "/" || location.pathname === "/signup";

  const [role, setRole] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedColor = localStorage.getItem("topbarColor");
    if (savedColor) setTopbarColor(savedColor);
  }, []);

  const handleColorChange = (color) => {
    setTopbarColor(color);
    localStorage.setItem("topbarColor", color);
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user && user.role) {
          setRole(user.role); // Update role if valid
        }
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ColorProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="app">
            {!hideSidebarTopbar && <Sidebar isSidebar={isSidebar} />}
            <main className="content">
              {!hideSidebarTopbar && (
                <Topbar
                  selectedColor={topbarColor}
                  onColorChange={handleColorChange} // Correctly passing this function
                />
              )}

              <Routes>
                <Route path="/" element={<LoginForm setRole={setRole} />} />
                <Route path="/signup" element={<SignupForm />} />

                <Route
                  path="/dashboard"
                  element={
                    loading ? (
                      <div>Loading...</div>
                    ) : role === "admin" ? (
                      <AdminDashboard />
                    ) : role === "user" ? (
                      <Navigate to="/project" />
                    ) : (
                      <Navigate to="/" />
                    )
                  }
                />

                <Route path="/team" element={<Team />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/form" element={<Form />} />
                <Route path="/bar" element={<Bar />} />
                <Route path="/pie" element={<Pie />} />
                <Route path="/line" element={<Line />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/geography" element={<Geography />} />
                <Route path="/user" element={<UserTable />} />
                <Route path="/hardware" element={<HardwareTable />} />
                <Route path="/project" element={<ProjectTable />} />
                <Route
                  path="/projectmanager/:project_id"
                  element={<ProjectManager />}
                />
                <Route path="/testbox" element={<TestBox />} />
                <Route
                  path="/projectchart/:gateway_name/:value_name"
                  element={<ProjectChart />}
                />
              </Routes>
            </main>
          </div>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </ColorProvider>
  );
}

export default App;
