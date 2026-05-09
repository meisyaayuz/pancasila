import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardSimple } from "./pages/DashboardSimple";
import { StudentReport } from "./pages/StudentReport";
import { AnalysisResult } from "./pages/AnalysisResult";
import { ReportDetail } from "./pages/ReportDetail";
import { MyReports } from "./pages/MyReports";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Settings } from "./pages/Settings";
import { Help } from "./pages/Help";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/reset-password",
    Component: ResetPassword,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { 
        index: true, 
        element: (
          <ProtectedRoute requireRole="teacher">
            <DashboardSimple />
          </ProtectedRoute>
        )
      },
      { 
        path: "student-report", 
        element: (
          <ProtectedRoute requireRole="student">
            <StudentReport />
          </ProtectedRoute>
        )
      },
      { 
        path: "analysis-result", 
        element: (
          <ProtectedRoute requireRole="student">
            <AnalysisResult />
          </ProtectedRoute>
        )
      },
      { 
        path: "report/:id", 
        element: (
          <ProtectedRoute requireRole="teacher">
            <ReportDetail />
          </ProtectedRoute>
        )
      },
      { 
        path: "my-reports", 
        element: (
          <ProtectedRoute requireRole="student">
            <MyReports />
          </ProtectedRoute>
        )
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "help",
        element: <Help />,
      },
    ],
  },
]);