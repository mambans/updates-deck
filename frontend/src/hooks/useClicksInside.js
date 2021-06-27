import { useEffect } from 'react';

const useClicksInside = (ref, func) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && ref.current.contains(event.target)) func(event);
    };

    document.addEventListener('mouseup', handleClickOutside);
    return () => document.removeEventListener('mouseup', handleClickOutside);
  }, [ref, func]);
};

export default useClicksInside;
