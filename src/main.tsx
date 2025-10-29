import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import SelectMusic from './SelectMusic.tsx';
import SelectMode from './SelectMode.tsx';
import SingAlong from './SingAlong.tsx';
import Login from './Login.tsx';
// eslint-disable-next-line react-refresh/only-export-components
function Root() {
  const [currentPage, setCurrentPage] = useState<
    'login' | 'home' | 'lesson' | 'history' | 'practice' | 'singalong'
  >('login');
  const [selectedSong, setSelectedSong] = useState<{ title: string; artist: string } | null>(null);

  const handleNavigate = (page: 'home' | 'lesson' | 'history') => {
    setCurrentPage(page);
  };

  if (currentPage === 'login') {
    return <Login onLogin={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'practice') {
    return <App />;
  }

  if (currentPage === 'singalong') {
    return <SingAlong currentPage="lesson" onNavigate={handleNavigate} />;
  }

  if (currentPage === 'home') {
    return (
      <SelectMusic
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onSelectMusic={song => {
          setSelectedSong(song);
          setCurrentPage('lesson');
        }}
      />
    );
  }

  if (currentPage === 'lesson') {
    return (
      <SelectMode
        currentPage={currentPage}
        onNavigate={handleNavigate}
        songInfo={selectedSong}
        onChangeSong={() => setCurrentPage('home')}
        onStartLesson={lessonType => {
          if (lessonType === 'line') {
            setCurrentPage('practice');
          } else if (lessonType === 'singalong') {
            setCurrentPage('singalong');
          }
        }}
      />
    );
  }

  // history 페이지는 구현 나중에 할께유...
  return (
    <SelectMusic
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onSelectMusic={song => {
        setSelectedSong(song);
        setCurrentPage('lesson');
      }}
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
