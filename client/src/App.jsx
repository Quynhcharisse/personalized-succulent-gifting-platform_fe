import {createBrowserRouter, Navigate, RouterProvider} from 'react-router-dom'
import Home from './components/auth/Home.jsx'
import Blogs from './components/auth/Blogs.jsx'
import OrderGuide from './components/auth/OrderGuide.jsx'
import SignIn from './components/auth/SignIn.jsx'
import AdminDashboard from './components/admin/AdminDashboard.jsx'
import SellerDashboard from './components/seller/SellerDashboard.jsx'
import {Slide} from '@mui/material';
import {SnackbarProvider} from "notistack";
import WebApplicationLayout from "./layouts/WebApplicationLayout.jsx";
import {GoogleOAuthProvider} from "@react-oauth/google";
import ProtectedRoute from './config/ProtectedRoute.jsx'

const router = createBrowserRouter([
    {
        path: '/',
        element: <WebApplicationLayout/>,
        children: [
            {
                index: true,
                element: <Home/>
            },
            {
                path: 'cham-soc',
                element: <Blogs/>
            },
            {
                path: 'huong-dan-mua-hang',
                element: <OrderGuide/>
            },
            {
                path: 'sign-in',
                element: <SignIn/>
            }
        ],
    },
    {
        path: 'admin',
        element: (
            <ProtectedRoute allowRoles={["admin"]}>
                <AdminDashboard />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Navigate to={'/admin/dashboard'} />
            }
        ]
    },
    {
        path: 'admin/dashboard',
        element: (
            <ProtectedRoute allowRoles={["admin"]}>
                <AdminDashboard />
            </ProtectedRoute>
        )
    },
    {
        path: 'seller',
        element: (
            <ProtectedRoute allowRoles={["seller"]}>
                <SellerDashboard />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Navigate to={'/seller/dashboard'} />
            }
        ]
    },
    {
        path: 'seller/dashboard',
        element: (
            <ProtectedRoute allowRoles={["seller"]}>
                <SellerDashboard />
            </ProtectedRoute>
        )
    },
    {
        path: '*',
        element: <Navigate to="/"/>
    },
])

export default function App() {
    const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "fallback_client_id"

    if (!clientID || clientID === "your_actual_google_client_id_here" || clientID === "fallback_client_id") {
        console.warn("Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file")
    }

    return (
        <SnackbarProvider
            maxSnack={3}
            autoHideDuration={3000}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            TransitionComponent={Slide}
            preventDuplicate={true}
        >
            <GoogleOAuthProvider clientId={clientID}>
                <RouterProvider router={router} />
            </GoogleOAuthProvider>
        </SnackbarProvider>
    )
}
