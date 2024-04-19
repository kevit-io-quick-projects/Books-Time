export const hoursToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':');
  return +hours * 60 + Number(minutes);
};

export const getCurrentDate = (month?: string) => {
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm: string | number = today.getMonth() + 1; // Months start at 0!
  let dd = `01`;
  mm = !month ? mm : mm === Number('01') ? `12` : Number(mm) - 1;
  if (Number(mm) < 10) mm = `0${mm}`;
  return `${mm}-${dd}-${yyyy}`;
};
