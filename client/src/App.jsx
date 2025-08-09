import {createBrowserRouter, Navigate, RouterProvider} from 'react-router-dom'
import Home from './components/auth/Home.jsx'
import Blogs from './components/auth/Blogs.jsx'
import OrderGuide from './components/auth/OrderGuide.jsx'
import SignIn from './components/auth/SignIn.jsx'
import GoogleResponse from './components/auth/GoogleResponse.jsx'
import {Grow} from '@mui/material'
import {SnackbarProvider} from "notistack";
import WebApplicationLayout from "./layouts/WebApplicationLayout.jsx";

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
            },
            {
                path: 'google/result',
                element: <GoogleResponse/>
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/"/>
    },
])

export default function App() {
    return (
        <SnackbarProvider
            maxSnack={4}
            anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            autoHideDuration={1500}
            TransitionComponent={Grow}
        >
            <RouterProvider router={router}/>
        </SnackbarProvider>
    )
}
