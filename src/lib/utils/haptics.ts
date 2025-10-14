export const triggerHapticFeedback = () => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(50) // 50ms vibration
    } catch (error) {
      console.warn('Haptic feedback not supported')
    }
  }
}