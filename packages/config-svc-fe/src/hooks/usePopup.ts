/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";

export function usePopup(ref: any) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClickOutSideOfMenu = useCallback(
    (e: any) => {
      const path = e.path || (e.composedPath && e.composedPath());
      if (path && !path.includes(ref.current) && isOpen) {
        setIsOpen(false);
      }
    },
    [ref, isOpen],
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("click", handleClickOutSideOfMenu);
    } else {
      window.removeEventListener("click", handleClickOutSideOfMenu);
    }
  }, [handleClickOutSideOfMenu, isOpen]);

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return {
    closeMenu,
    isOpen,
    openMenu,
    toggleMenu,
  };
}
