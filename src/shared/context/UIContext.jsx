import { createContext, useContext, useState, useEffect } from "react";

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Home');
  const [modalPostId, setModalPostId] = useState(null);

  // Эффект для сброса activeMenu при закрытии модалки Create
  useEffect(() => {
    if (!isCreateModalOpen && activeMenu === "Create") {
      setActiveMenu("Home");
    }
  }, [isCreateModalOpen, activeMenu]);

  const value = {
    isSearchOpen,
    setSearchOpen,
    isNotificationsOpen,
    setNotificationsOpen,
    isCreateModalOpen,
    setCreateModalOpen,
    activeMenu,
    setActiveMenu,
    modalPostId,
    setModalPostId
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);