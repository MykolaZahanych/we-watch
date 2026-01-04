import { useNavigate } from 'react-router-dom';
import MovieList from '@/components/movies/MovieList';
import Layout from '@/components/layout/Layout';

export default function HomePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <Layout onLogout={handleLogout}>
      <MovieList />
    </Layout>
  );
}

