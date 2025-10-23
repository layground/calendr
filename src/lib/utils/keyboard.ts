export const handleKeyboardActivation = (e: React.KeyboardEvent, callback: (e: React.KeyboardEvent) => void) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    callback(e);
  }
};
