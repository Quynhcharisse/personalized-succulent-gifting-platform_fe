import React, {lazy, Suspense} from 'react'
import './styles/App.css'
import {createBrowserRouter, Navigate, RouterProvider} from 'react-router-dom'
import {GoogleOAuthProvider} from '@react-oauth/google'
import {SnackbarProvider} from 'notistack'
import {createTheme, CssBaseline, Slide, ThemeProvider} from '@mui/material'

// Buyer components
const SucculentList = lazy(() => import('./components/buyer/SucculentList.jsx'))
const SucculentDetail = lazy(() => import('./components/buyer/SucculentDetail.jsx'))
const PotAccessoryDesigner = lazy(() => import('./components/buyer/PotAccessoryDesigner.jsx'))
const BuyerPosts = lazy(() => import('./components/buyer/post/BuyerPosts.jsx'))
const ProductList = lazy(() => import('./components/buyer/product/ProductList.jsx'))
const ProductDetail = lazy(() => import('./components/buyer/product/ProductDetail.jsx'))
const CustomRequest = lazy(() => import('./components/buyer/custom/CustomRequest.jsx'))

// Lazy imports for layouts and frequently used components
const WebApplicationLayout = lazy(() => import('./layouts/WebApplicationLayout.jsx'))
const ProtectedRoute = lazy(() => import('./config/ProtectedRoute.jsx'))

// Lazy imports for auth components
const Home = lazy(() => import('./components/auth/Home.jsx'))
const Blogs = lazy(() => import('./components/auth/Blogs.jsx'))
const OrderGuide = lazy(() => import('./components/auth/OrderGuide.jsx'))
const SignIn = lazy(() => import('./components/auth/SignIn.jsx'))

// Lazy imports for admin components
const AdminDashboard = lazy(() => import('./layouts/AdminDashboard.jsx'))
const AccountBuyerInfo = lazy(() => import('./components/admin/AccountBuyerInfo.jsx'))

// Lazy imports for seller components
const SellerDashboard = lazy(() => import('./layouts/SellerDashboard.jsx'))
const SucculentForm = lazy(() => import('./components/seller/succulent/Succulent.jsx'))
const Accessory = lazy(() => import('./components/seller/accessory/Accessory.jsx'))
const PostsManager = lazy(() => import('./components/seller/post/PostsManager.jsx'))
const ProductTable = lazy(() => import('./components/seller/product/ProductTable.jsx'))

// Lazy imports for account components
const UserProfile = lazy(() => import('./components/account/UserProfile.jsx'))

const CheckoutPage = lazy(() => import('./components/buyer/Checkout/CheckoutPage.jsx'))

// Enhanced Loading component for Suspense fallback with responsive design
const LoadingFallback = () => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: '"Open Sans", sans-serif',
        padding: '20px',
        boxSizing: 'border-box'
    }}>
        <div style={{
            width: 'clamp(40px, 8vw, 60px)',
            height: 'clamp(40px, 8vw, 60px)',
            border: 'clamp(3px, 0.8vw, 5px) solid #e3e3e3',
            borderTop: 'clamp(3px, 0.8vw, 5px) solid #1976d2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: 'clamp(15px, 4vw, 25px)'
        }}></div>
        <div style={{
            fontSize: 'clamp(14px, 4vw, 18px)',
            color: '#666',
            fontWeight: '500',
            textAlign: 'center',
            lineHeight: '1.5'
        }}>
            Đang tải...
        </div>
        <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @media (max-width: 480px) {
        body {
          font-size: 14px;
        }
      }
      
      @media (min-width: 768px) and (max-width: 1024px) {
        body {
          font-size: 16px;
        }
      }
      
      @media (min-width: 1025px) {
        body {
          font-size: 18px;
        }
      }
    `}</style>
    </div>
)

// Custom theme configuration with responsive design
const theme = createTheme({
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
    },
    typography: {
        fontFamily: 'Inter, "Open Sans", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        h1: {
            fontFamily: 'Inter, "Open Sans", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
            lineHeight: 1.2,
        },
        h2: {
            fontFamily: 'Inter, "Open Sans", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            lineHeight: 1.3,
        },
        h3: {
            fontFamily: 'Inter, "Open Sans", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)',
            lineHeight: 1.4,
        },
        h4: {
            fontFamily: 'Inter, "Open Sans", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
            lineHeight: 1.4,
        },
        h5: {
            fontFamily: 'Inter, "Open Sans", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            lineHeight: 1.5,
        },
        h6: {
            fontFamily: 'Inter, "Open Sans", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
            lineHeight: 1.5,
        },
        body1: {
            fontFamily: 'Inter, "Open Sans", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: 'clamp(0.875rem, 2vw, 1rem)',
            lineHeight: 1.6,
        },
        body2: {
            fontFamily: 'Inter, "Open Sans", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)',
            lineHeight: 1.6,
        },
        button: {
            fontFamily: 'Inter, "Open Sans", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: 'clamp(0.875rem, 2vw, 1rem)',
            fontWeight: 600,
        },
        caption: {
            fontFamily: 'Inter, "Open Sans", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: 'clamp(0.6rem, 1.5vw, 0.75rem)',
            lineHeight: 1.4,
        },
        overline: {
            fontFamily: 'Inter, "Open Sans", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: 'clamp(0.6rem, 1.5vw, 0.75rem)',
            letterSpacing: '0.08em',
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    fontFamily: 'Inter, "Open Sans", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    margin: 0,
                    padding: 0,
                    boxSizing: 'border-box',
                    fontSize: 'clamp(14px, 2vw, 16px)',
                    overflowX: 'hidden',
                },
                html: {
                    fontSize: 'clamp(14px, 2vw, 16px)',
                },
                '*': {
                    boxSizing: 'border-box',
                },
                '@media (max-width: 600px)': {
                    body: {
                        fontSize: '14px',
                    },
                },
                '@media (min-width: 600px) and (max-width: 900px)': {
                    body: {
                        fontSize: '15px',
                    },
                },
                '@media (min-width: 900px)': {
                    body: {
                        fontSize: '16px',
                    },
                },
            },
        },
        // Add responsive container styling
        MuiContainer: {
            styleOverrides: {
                root: {
                    paddingLeft: 'clamp(16px, 4vw, 24px)',
                    paddingRight: 'clamp(16px, 4vw, 24px)',
                    '@media (max-width: 600px)': {
                        paddingLeft: '16px',
                        paddingRight: '16px',
                    },
                },
            },
        },
        // Responsive button styling
        MuiButton: {
            styleOverrides: {
                root: {
                    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                    padding: 'clamp(8px, 2vw, 12px) clamp(16px, 4vw, 24px)',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                },
                small: {
                    fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)',
                    padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)',
                },
                large: {
                    fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
                    padding: 'clamp(12px, 3vw, 16px) clamp(20px, 5vw, 32px)',
                },
            },
        },
    },
})

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <Suspense fallback={<LoadingFallback/>}>
                <WebApplicationLayout/>
            </Suspense>
        ),
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<LoadingFallback/>}>
                        <Home/>
                    </Suspense>
                )
            },
            {
                path: 'cham-soc',
                element: (
                    <Suspense fallback={<LoadingFallback/>}>
                        <Blogs/>
                    </Suspense>
                )
            },
            {
                path: 'huong-dan-mua-hang',
                element: (
                    <Suspense fallback={<LoadingFallback/>}>
                        <OrderGuide/>
                    </Suspense>
                )
            },
            {
                path: 'login',
                element: (
                    <Suspense fallback={<LoadingFallback/>}>
                        <SignIn/>
                    </Suspense>
                )
            },
            {
                path: 'checkout',
                element: (
                    <Suspense fallback={<LoadingFallback/>}>
                        <CheckoutPage/>
                    </Suspense>
                )
            },
            {
                path: 'product',
                element: <ProductList/>
            },
            {
                path: 'product/:id',
                element: <ProductDetail/>
            },
            {
                path: 'custom-request',
                element: (
                    <Suspense fallback={<LoadingFallback/>}>
                        <CustomRequest/>
                    </Suspense>
                )
            },
        ],
    },
    {
        path: 'admin',
        element: (
            <Suspense fallback={<LoadingFallback/>}>
                <ProtectedRoute allowRoles={["ADMIN"]}>
                    <Suspense fallback={<LoadingFallback/>}>
                        <AdminDashboard/>
                    </Suspense>
                </ProtectedRoute>
            </Suspense>
        ),
        children: [
            {
                index: true,
                element: <Navigate to={'/admin/dashboard'} replace/>
            },
            {
                path: 'dashboard',
                // AdminDashboard component tự xử lý nội dung khi pathname === '/admin/dashboard'
                element: null
            },
            {
                path: 'users',
                element: (
                    <Suspense fallback={<LoadingFallback/>}>
                        <AccountBuyerInfo/>
                    </Suspense>
                )
            }
        ]
    },
    {
        path: 'seller',
        element: (
            <Suspense fallback={<LoadingFallback/>}>
                <ProtectedRoute allowRoles={["SELLER"]}>
                    <Suspense fallback={<LoadingFallback/>}>
                        <SellerDashboard/>
                    </Suspense>
                </ProtectedRoute>
            </Suspense>
        ),
        children: [
            {
                index: true,
                element: <Navigate to={'/seller/dashboard'}/>
            },
            {
                path: 'dashboard',
                element: <h1>Dashboard Pannel</h1>
            },
            {
                path: 'profile',
                element: (
                    <Suspense fallback={<LoadingFallback/>}>
                        <UserProfile/>
                    </Suspense>
                )
            },
            {
                path: 'succulent',
                element: (
                    <Suspense fallback={<LoadingFallback/>}>
                        <SucculentForm/>
                    </Suspense>
                )
            },
            {
                path: 'accessory',
                element: (
                    <Suspense fallback={<LoadingFallback/>}>
                        <Accessory/>
                    </Suspense>
                )
            },
            {
                path: 'products',
                element: (
                    <Suspense fallback={<LoadingFallback/>}>
                        <ProductTable/>
                    </Suspense>
                )
            },
            {
                path: 'store',
                element: <h1>Cửa hàng của tôi</h1>
            },
            {
                path: 'orders',
                element: <h1>Quản lý đơn hàng</h1>
            },
            {
                path: 'analytics',
                element: <h1>Báo cáo & Thống kê</h1>
            },
            {
                path: 'settings',
                element: <h1>Cài đặt</h1>
            },
            {
                path: '/seller/posts',
                element: <PostsManager/>
            }
        ]
    },
    {
        path: 'buyer',
        element: (
            <Suspense fallback={<LoadingFallback/>}>
                <ProtectedRoute allowRoles={["BUYER"]}>
                    <Suspense fallback={<LoadingFallback/>}>
                        <WebApplicationLayout/>
                    </Suspense>
                </ProtectedRoute>
            </Suspense>
        ),
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<LoadingFallback/>}>
                        <Home/>
                    </Suspense>
                )
            },
            {
                path: 'profile',
                element: (
                    <Suspense fallback={<LoadingFallback/>}>
                        <UserProfile/>
                    </Suspense>
                )
            },
            {
                path: 'succulent',
                element: <SucculentList/>
            },
            {
                path: 'succulent/:id',
                element: <SucculentDetail/>
            },
            {
                path: 'succulent/:id/design',
                element: <PotAccessoryDesigner/>
            },
            {
                path: 'posts',
                element: <BuyerPosts/>
            },
        ]
    },
    {
        path: 'profile',
        element: <Navigate to="/buyer/profile"/>
    },
    {
        path: '*',
        element: <Navigate to="/"/>
    },
])

export default function App() {
    const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "fallback_client_id"

    return (
        <SnackbarProvider
            maxSnack={3}
            autoHideDuration={3000}
            anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            TransitionComponent={Slide}
            preventDuplicate={true}
        >
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <GoogleOAuthProvider clientId={clientID}>
                    <RouterProvider router={router}/>
                </GoogleOAuthProvider>
            </ThemeProvider>
        </SnackbarProvider>
    )
}