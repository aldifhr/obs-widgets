import { HashRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/Home'
import SocialFollowPage from './pages/SocialFollow'
import SocialRotatorPage from './pages/SocialRotator'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/social-follow" element={<SocialFollowPage />} />
        <Route path="/social-rotator" element={<SocialRotatorPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
