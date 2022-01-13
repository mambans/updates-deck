import { useEffect } from 'react';

const useClicksOutside = (ref, func = () => {}, mount = true) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (Array.isArray(ref) && ref?.length >= 1) {
        if (
          ref.every(
            (ele) => (ele?.current || ref) && !(ele?.current || ref)?.contains?.(event.target)
          )
        ) {
          func(event);
        }
      } else if ((ref?.current || ref) && !(ref?.current || ref)?.contains?.(event.target))
        func(event);
    };

    if (mount) document.addEventListener('mouseup', handleClickOutside);
    return () => document.removeEventListener('mouseup', handleClickOutside);
  }, [ref, func, mount]);
};

export default useClicksOutside;
