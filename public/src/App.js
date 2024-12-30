import { useState, useEffect } from "react";
import { Routes, Route , useLocation , Navigate} from "react-router-dom";
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


function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const location = useLocation(); 

  const hideSidebarTopbar = location.pathname === '/' || location.pathname === '/signup'; 
  const [role , setRole] = useState(null);

  const [loading, setLoading] = useState(true);  // Track if data is still loading
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);  // Safely parse the stored user data
        if (user && user.role) {
          setRole(user.role);  // Update role if valid
        }
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      localStorage.removeItem('user');  // Clear invalid data if needed
    } finally {
      setLoading(false);  // Data load is complete
    }
  }, []);
  
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {!hideSidebarTopbar &&  ( 
            <Sidebar isSidebar={isSidebar} />
          )}
          <main className="content">
            {!hideSidebarTopbar && ( 
              <Topbar setIsSidebar={setIsSidebar} />
            )}
            <Routes>
              {/* <Route path="/" element={<LoginForm />} /> */}
              <Route path="/" element={<LoginForm setRole={setRole} />} /> 
              <Route path="/signup" element={<SignupForm/>}/>

              <Route 
            path="/dashboard" 
            element={
              loading ? (
                <div>Loading...</div>  // Show a loading indicator while determining role
              ) : role === 'admin' ? (
                <AdminDashboard />
              ) : role === 'user' ? (
                <Dashboard />
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
              <Route path="/hardware" element={<HardwareTable/>} />
              <Route path="/project" element={<ProjectTable/>}/>
              <Route path="/projectmanager/:project_id" element={<ProjectManager/>}/>
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;