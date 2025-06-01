# Keyboard Handling Solution for React Native Onboarding

## Problem Statement
When implementing text inputs in React Native onboarding flows, several common issues arise:
1. Navigation buttons get hidden behind the keyboard
2. Black box appears around navigation area (backgroundColor issue)
3. Text input gets covered by keyboard, preventing users from seeing what they're typing
4. Poor UX when keyboard appears/disappears

## The Solution

### Key Components

#### 1. **Proper Layout Structure**
```jsx
<SafeAreaView style={styles.safeArea}>
  <View style={styles.container}>
    {/* Progress always at top, outside KeyboardAvoidingView */}
    <View style={styles.progressContainer}>
      {/* Progress bar */}
    </View>

    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      {/* Scrollable content */}
      <ScrollView>
        {/* Your content with text inputs */}
      </ScrollView>

      {/* Navigation stays at bottom */}
      <View style={[
        styles.navigationContainer,
        { paddingBottom: keyboardHeight > 0 ? SPACING.xl : SPACING.lg }
      ]}>
        {/* Back and Continue buttons */}
      </View>
    </KeyboardAvoidingView>
  </View>
</SafeAreaView>
```

#### 2. **Keyboard Height Tracking**
```jsx
const [keyboardHeight, setKeyboardHeight] = useState(0);

useEffect(() => {
  const keyboardWillShow = Keyboard.addListener(
    Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
    (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    }
  );

  const keyboardWillHide = Keyboard.addListener(
    Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
    () => {
      setKeyboardHeight(0);
    }
  );

  return () => {
    keyboardWillShow.remove();
    keyboardWillHide.remove();
  };
}, []);
```

#### 3. **Critical Styling Rules**
```jsx
navigationContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: SPACING.lg,
  paddingHorizontal: SPACING.lg,
  // DO NOT add backgroundColor - causes black box issue!
  borderTopWidth: 1,
  borderTopColor: 'rgba(255,255,255,0.1)',
},
```

### Common Pitfalls to Avoid

1. **Don't use `backgroundColor: COLORS.background`** on navigation containers
   - This creates the black box issue
   - Let the container inherit the parent's background

2. **Don't wrap the entire screen in KeyboardAvoidingView**
   - Only wrap the content that needs to adjust
   - Keep progress indicators and fixed headers outside

3. **Don't use absolute positioning for navigation**
   - Makes keyboard handling more complex
   - Use flex layout instead

### Alternative Approach: Modal for Text Input

For a cleaner UX, consider using a Modal for text inputs:

```jsx
<Modal
  visible={showCustomInput}
  animationType="slide"
  transparent={true}
  onRequestClose={closeCustomInput}
>
  <View style={styles.modalOverlay}>
    <TouchableOpacity 
      style={styles.modalBackdrop} 
      activeOpacity={1} 
      onPress={closeCustomInput}
    />
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.modalKeyboardView}
    >
      <View style={styles.modalContent}>
        {/* Modal content with input */}
      </View>
    </KeyboardAvoidingView>
  </View>
</Modal>
```

## Testing Checklist

- [ ] Navigation buttons stay visible when keyboard appears
- [ ] No black box around navigation area
- [ ] Text input is visible above keyboard
- [ ] Smooth transitions when keyboard appears/disappears
- [ ] Works on both iOS and Android
- [ ] Navigation buttons remain functional with keyboard open

## Summary

The key to clean keyboard handling is:
1. Proper component hierarchy with KeyboardAvoidingView
2. Dynamic padding based on keyboard height
3. Avoiding backgroundColor on navigation containers
4. Using appropriate keyboardVerticalOffset for iOS

This solution provides a professional, app-store quality experience that users expect from modern mobile apps. 