import React, { useState } from 'react';
import { MdSort } from 'react-icons/md';

import { SortButton, SortDropDownList } from './StyledComponents';
import { Link } from 'react-router-dom';

const PRE_DEFINED_DAY_OPTIONS = [0, 3, 7, 14, 30, 90, 180, 365];

const convertDays = (nrOfDays) => {
  if (!nrOfDays) return 'lifetime';
  if (!PRE_DEFINED_DAY_OPTIONS?.includes(nrOfDays))
    return nrOfDays + ` Day${nrOfDays === 1 ? '' : 's'}`;

  const rawWeeks = Math.round(Math.min(nrOfDays / 7, 4));
  const rawMonths = Math.round(Math.min(nrOfDays / 30, 12));
  const rawYears = Math.round(Math.min(nrOfDays / 365, 10));

  const weeks = rawWeeks * 7 + 3 === 31 ? null : rawWeeks;
  const months = rawMonths / 12 === 1 ? null : rawMonths;
  const days = nrOfDays - (weeks * 7 + months * 30 + rawYears * 365);

  const FinallOutput =
    (rawYears && rawYears + ` year${rawYears > 1 ? 's' : ''}`) ||
    (months && months + ` month${months > 1 ? 's' : ''}`) ||
    (weeks && weeks + ` week${weeks > 1 ? 's' : ''}`) ||
    (days && days + ` day${days > 1 ? 's' : ''}`) ||
    '';
  return FinallOutput;
};

export default ({ sortBy: days, setSortBy, setData, resetOldData }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginLeft: '0px' }}>
      <SortButton
        title={`Fetch clips from the last ${convertDays(days)}`}
        onClick={() => setOpen(!open)}
      >
        <MdSort size={30} />
        Within: {convertDays(days)}
      </SortButton>
      {open && (
        <SortDropDownList>
          {PRE_DEFINED_DAY_OPTIONS.map((option) => (
            <Link
              to={`?type=clips&within=${option}`}
              key={option}
              onClick={() => {
                if (option !== days && option !== '' + days) {
                  setData();
                  if (resetOldData) resetOldData();
                  setSortBy(option);
                  setOpen(false);
                }
              }}
            >
              {convertDays(option)}
            </Link>
          ))}
        </SortDropDownList>
      )}
    </div>
  );
};
