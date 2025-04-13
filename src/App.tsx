import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import RiskAssessment from "./pages/RiskAssessment";
import ResourceOptimization from "./pages/ResourceOptimization";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Home from "./pages/Index";
import DataUpload from "./pages/DataUpload";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar isOpen={isSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/dashboard"
                element={
                  <SignedIn>
                    <Dashboard />
                  </SignedIn>
                }
              />
              <Route
                path="/risk-assessment"
                element={
                  <SignedIn>
                    <RiskAssessment />
                  </SignedIn>
                }
              />
              <Route
                path="/resource-optimization"
                element={
                  <SignedIn>
                    <ResourceOptimization />
                  </SignedIn>
                }
              />
              <Route
                path="/data-upload"
                element={
                  <SignedIn>
                    <DataUpload />
                  </SignedIn>
                }
              />
              <Route
                path="/sign-in"
                element={
                  <SignedOut>
                    <SignIn />
                  </SignedOut>
                }
              />
              <Route
                path="/sign-up"
                element={
                  <SignedOut>
                    <SignUp />
                  </SignedOut>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
