import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import "@fontsource/lato/300.css"
import "@fontsource/lato/400.css"
import "@fontsource/lato/700.css"
import '@fontsource-variable/inter';
import '@fontsource-variable/inter/wght-italic.css';

import './App.scss'

import { useStore } from 'zustand';
import { useSessionState } from './session/SessionState.ts';
import { BrowserRouter, Routes } from 'react-router-dom';
import { AllRoutes } from './components/navigation/AllRoutes.tsx';
import { NavigationApp } from './components/navigation/NavigationApp.tsx';
import { LoginApp } from './apps/login/LoginApp.tsx';
import moment from 'moment';

function App() {
  const session = useStore(useSessionState)
  const sessionExpired: boolean = session.sessionExpires != undefined && moment().isAfter(moment(session.sessionExpires))

  if (session.userID && sessionExpired) {
    session.logOut(session.userID)
  }

  if (!session.isAuthenticated || !session.sessionExpires) {
    return <LoginApp />
  }

  return <BrowserRouter>
    <NavigationApp />
    <Routes>
      {AllRoutes}
    </Routes>
  </BrowserRouter>
}

export default App