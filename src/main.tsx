import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Shell from '@/ui/Shell'
import Home from '@/pages/Home'
import List from '@/pages/List'
import Checklist from '@/pages/Checklist'
import Admin from '@/pages/Admin'
import Validate from '@/pages/Validate'
import { bootIfEmpty } from '@/store/boot'

bootIfEmpty()

const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <Home /> },
      { path: 'list/:nodeId', element: <List /> },
      { path: 'check/:nodeId', element: <Checklist /> },
      { path: 'admin', element: <Admin /> },
      { path: 'validate', element: <Validate /> },
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
