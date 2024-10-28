export const saveToSession = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const getFromSession = (key) => {
  const value = sessionStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

export const updateSession = (key, updater) => {
  const currentValue = getFromSession(key);
  const newValue = updater(currentValue);
  saveToSession(key, newValue);
  return newValue;
};