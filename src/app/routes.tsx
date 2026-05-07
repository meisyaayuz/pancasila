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
    ],
  },
]);