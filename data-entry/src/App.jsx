import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Header from './components/Header'
import LoginPage from './components/LoginPage'
import ModeSelector from './components/ModeSelector'
import AddDashboard from './components/AddMode/AddDashboard'
import WorkQueue from './components/AddMode/WorkQueue'
import PoliticianDetail from './components/AddMode/PoliticianDetail'
import StanceForm from './components/AddMode/StanceForm'
import ReviewQueue from './components/ReviewMode/ReviewQueue'
import ReviewForm from './components/ReviewMode/ReviewForm'
import PoliticianList from './components/ManageMode/PoliticianList'
import AddPoliticianForm from './components/ManageMode/AddPoliticianForm'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading">Checking session...</div>
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ModeSelector />} />
          <Route path="/add" element={<AddDashboard />} />
          <Route path="/add/queue" element={<WorkQueue />} />
          <Route path="/add/politician/:politicianId" element={<PoliticianDetail />} />
          <Route path="/add/stance/:politicianId/:topicKey" element={<StanceForm />} />
          <Route path="/review" element={<ReviewQueue />} />
          <Route path="/review/:contextKey" element={<ReviewForm />} />
          <Route path="/manage" element={<PoliticianList />} />
          <Route path="/manage/add" element={<AddPoliticianForm />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
