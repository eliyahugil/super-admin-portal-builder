
import { useState, useEffect, useRef } from 'react';

export const useDropdownState = () => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        console.log('👆 Click outside - closing dropdown');
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openDropdown = () => {
    console.log('📂 Opening dropdown');
    setIsOpen(true);
  };

  const closeDropdown = () => {
    console.log('📁 Closing dropdown');
    setIsOpen(false);
  };

  return {
    isOpen,
    inputRef,
    dropdownRef,
    openDropdown,
    closeDropdown
  };
};
