import { useNavigate } from 'react-router-dom'
import { Collection } from '../components/Collection'

export default function HomePage() {
  const navigate = useNavigate()
  return <Collection onSelect={(id) => navigate(`/${id}`)} />
}
