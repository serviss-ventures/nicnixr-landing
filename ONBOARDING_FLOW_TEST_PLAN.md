# Onboarding Flow Test Plan

## Testing the Step 7 → Step 8 Improvements

### Prerequisites
1. Start the app: `cd mobile-app && npx expo start --clear`
2. Reset the app to test onboarding: Use `appReset.dev()` in console

### Test Scenarios

#### 1. Complete Flow Test
1. Go through onboarding steps 1-6 normally
2. On Step 7 (Analysis):
   - ✓ Verify you see "Smart Analysis" (not "Medical Grade Analysis")
   - ✓ Check that success probability is displayed
   - ✓ Verify no emojis appear in strengths/strategies lists
   - ✓ Confirm button says "View Your Recovery Plan"

3. Click "View Your Recovery Plan" to go to Step 8:
   - ✓ Verify smooth transition (no jarring change)
   - ✓ Check header says "Your Recovery Roadmap"
   - ✓ Confirm it references YOUR success % from Step 7
   - ✓ See personalized quit date message

#### 2. Interactive Sections Test
On Step 8, test each collapsible section:
- ✓ Click "Your Daily Experience" - should expand/collapse
- ✓ Click "Neural Recovery Map" - should expand/collapse
- ✓ Click "Recovery Warriors" - should expand/collapse
- ✓ Click "Smart Recovery Journal" - should expand/collapse

#### 3. Visual Design Check
- ✓ No basic emojis (❌, ✅, 🔥, ★) anywhere
- ✓ Custom icons display correctly:
  - Sun icon (orange with rays)
  - Brain icon (purple, two hemispheres)
  - People icon (three colored circles)
  - Journal icon (blue book with lines)
- ✓ All text is readable and well-spaced
- ✓ Consistent design with steps 1-7

#### 4. Content Flow Check
- ✓ Step 7 focuses on analysis results
- ✓ Step 8 focuses on the recovery plan features
- ✓ No duplicate success probability display
- ✓ Natural progression from results → plan
- ✓ Final CTA is clear: "Begin Your Recovery Journey"

#### 5. Edge Cases
- Test with different quit dates:
  - ✓ Today (immediate quit)
  - ✓ Future date (shows days until quit)
- Test with different products:
  - ✓ Cigarettes
  - ✓ Vape
  - ✓ Pouches
  - ✓ Other

### Expected Results
- Users should understand they're moving from analysis results to their actual recovery plan
- The transition should feel natural and connected
- No confusion about why there are two pages
- Clear value proposition without feeling "sales-y"
- Professional, modern design throughout

### Known Issues to Watch For
- If success probability doesn't transfer from Step 7 to 8, check console for errors
- If icons don't display properly, may need to refresh
- If sections don't expand/collapse, check touch handlers

### Success Criteria
✅ User understands the flow from analysis → plan
✅ No repetitive content between steps
✅ Professional design with custom icons
✅ Smooth, natural progression
✅ Clear call-to-action at the end 