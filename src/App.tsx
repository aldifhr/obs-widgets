import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/Home'
import SocialFollowPage from './pages/SocialFollow'
import SocialRotatorPage from './pages/SocialRotator'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/social-follow" element={<SocialFollowPage />} />
        <Route path="/social-rotator" element={<SocialRotatorPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
