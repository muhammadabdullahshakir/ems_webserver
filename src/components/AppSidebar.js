import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { AppSidebarNav } from './AppSidebarNav'
import { sygnet } from 'src/assets/brand/sygnet'
import logo from '../assets/images/avatars/022.png'
import { getUserFromLocalStorage } from '../data/localStorage'; // adjust the path


// Sidebar nav config
import _nav from '../_nav'
import { Typography } from '@mui/material'
import { useLocation } from 'react-router-dom'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const location = useLocation();


  // State for storing user info
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [user, setUser] = useState({ name: '', avatar: '' });

  const [role, setRole] = useState('') // Store user role here
  
  
  useEffect(() => {
    const userData = getUserFromLocalStorage();
    if (userData) {
      setUser({
        name: `${userData.firstname} ${userData.lastname}`,
        avatar: userData.image,
      });
    }
    console.log("UserData: ",userData);


  }, []);

  useEffect(() => {
    // Retrieve user data from localStorage
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      setFirstname(user.firstname || '')
      setLastname(user.lastname || '')
      setRole(user.role || '')  // Set the role from localStorage
    }
  }, [])

  
  // Filter navigation based on user role
  const roleNavConfig = {
    superadmin: _nav.filter(item => ['DashBoard','Dash-Board','Pages', 'Manage Admins', 'Manage Admin','Create Admin', 'Manage Gateway','Invoices', 'Notification',].includes(item.name)),
    admin: _nav.filter(item => ['DashBoard','Dashboard','Pages', 'Manage Users', 'Create User', 'Manage Hardware', 'Manage Invoices', 'View Invoices'].includes(item.name)),
    user: _nav.filter(item => ['DashBoard','Dashboard','Pages', 'Analytics', 'Invoices', 'User Details'].includes(item.name)),
    // Add more roles as needed
  };
  
  const filteredNav = roleNavConfig[role] || [];
  
  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <div className="border-bottom flex-col">
        <CSidebarBrand to="/">
          {/* Logo Image */}
          <img
            src="https://mexemai.com/bucket/ems/image/022.png"
            alt="Logo"
            style={{
              height: '120px',
              width: 'auto',
              display: 'block',
              margin: '0 auto', // Center the logo
            }}
            className="sidebar-brand-full"
          />
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
        </CSidebarBrand>

        {/* Display Firstname and Lastname below the logo, centered */}
        
          <div
            style={{
              textAlign: 'center',
              marginTop: '10px',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            <Typography>{user.name || 'Loading...'}</Typography>
          </div>
        

        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </div>

      {/* Pass the filtered navigation items */}
      <AppSidebarNav items={filteredNav} />

      <CSidebarFooter className="border-top d-none d-lg-flex">
        {/* <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        /> */}
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
