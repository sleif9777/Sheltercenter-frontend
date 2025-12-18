import moment from 'moment';
import { BrowserRouter, Routes } from 'react-router-dom';
import { useStore } from 'zustand';

import { LoginApp } from './apps/login/LoginApp.tsx';
import { AllRoutes } from './components/navigation/AllRoutes.tsx';
import { NavigationApp } from './components/navigation/NavigationApp.tsx';
import { useSessionState } from './session/SessionState.ts';

import './App.scss'
import '@fontsource-variable/inter/wght-italic.css';
import "@fontsource/lato/300.css"
import "@fontsource/lato/400.css"
import "@fontsource/lato/700.css"
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

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
    <div id="content">
      <Routes>
        {AllRoutes}
      </Routes>
    </div>
  </BrowserRouter>
}

export default App