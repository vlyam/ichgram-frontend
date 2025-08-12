import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUI } from '../shared/context/UIContext';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuth } from '../redux/auth/auth-selectors';
import { checkAuth } from '../redux/auth/auth-thunks';

import MainLayout from '../shared/layouts/MainLayout/MainLayout';
import Footer from '../shared/layouts/Footer/Footer';
import Nav from '../shared/components/Nav/Nav';
import AddPost from '../modules/AddPost/AddPost';
import ViewPost from '../modules/ViewPost/ViewPost';
import Modal from '../shared/components/Modal/Modal';
import BackToTopButton from '../shared/components/BackToTopButton/BackToTopButton';
import Navigation from './Navigation';

// Список публичных роутов (не требуют авторизации)
const publicRoutes = [
  '/login',
  '/signup',
  '/reset',
  '/verify',
  '/learn-more',
  '/terms',
  '/privacy-policy',
  '/cookies-policy',
];

// Список защищённых роутов, требующих авторизации
const protectedRoutes = [
  '/explore',
  '/messages',
  '/profile',
  '/search',
  '/notifications',
  '/create',
];

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);

  // Контекст UI для модальных окон и меню
  const {
    setActiveMenu,
    isCreateModalOpen,
    setCreateModalOpen,
    modalPostId,
    setModalPostId,
  } = useUI();

  // Проверка токена и авторизации при монтировании компонента
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Редирект неавторизованных пользователей с защищённых роутов на /login
  useEffect(() => {
    const currentPath = location.pathname;
    const isProtected = protectedRoutes.some((route) =>
      currentPath.startsWith(route)
    );

    if (!isAuth && isProtected) {
      navigate('/login', { replace: true });
    }
  }, [isAuth, location.pathname, navigate]);

  // Редирект авторизованных пользователей с публичных страниц на главную "/"
  useEffect(() => {
    const currentPath = location.pathname;
    const isPublic = publicRoutes.includes(currentPath);

    if (isAuth && isPublic) {
      navigate('/', { replace: true });
    }
  }, [isAuth, location.pathname, navigate]);

  // Обработка ситуации, когда нужно убрать состояние background при переходе
  useEffect(() => {
    const path = location.pathname;
    if (path !== '/search' && path !== '/notifications') {
      if (location.state?.background) {
        navigate(path, { replace: true });
      }
    }
  }, [location, navigate]);

  // Установка текущего активного меню в контексте UI
  useEffect(() => {
    const currentPath = location.pathname;
    let menuName = 'Home';
    if (currentPath.startsWith('/explore')) menuName = 'Explore';
    else if (currentPath.startsWith('/messages')) menuName = 'Messages';
    else if (currentPath === '/profile' || currentPath === '/profile/edit') {
      menuName = 'Profile';
    } else if (currentPath.startsWith('/search')) menuName = 'Search';
    else if (currentPath.startsWith('/notifications')) menuName = 'Notifications';

    setActiveMenu(menuName);
  }, [location.pathname, setActiveMenu]);

  // Отрисовка без сайдбара и футера для публичных страниц
  if (!isAuth && publicRoutes.includes(location.pathname)) {
    return (
      <div className="app">
        <Navigation />
      </div>
    );
  }

  // Основной рендер приложения
  return (
    <div className="app">
      <div className="wrapper">
        <Nav />
        <MainLayout>
          <Navigation />
        </MainLayout>
      </div>

      {(isCreateModalOpen || modalPostId) && (
        <Modal
          close={() => {
            if (isCreateModalOpen) {
              setCreateModalOpen(false);
            } else if (modalPostId) {
              setModalPostId(null);
            }
          }}
        >
          {isCreateModalOpen ? (
            <AddPost />
          ) : (
            <ViewPost postId={modalPostId} onClose={() => setModalPostId(null)} />
          )}
        </Modal>
      )}

      <Footer />
      <BackToTopButton position="BottomRight" />
    </div>
  );
}

export default App;