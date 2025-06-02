# Recovery Overview Layout Fixes TODO

## Partially Fixed
- ✅ Changed Recovery Components grid from 30% to 48% width
- ✅ Added flexWrap: 'wrap' to create proper 2x2 grid

## Still Needs Fixing

### 1. Recovery Component Cards
- **Issue**: Text still appears cut off ("Neur al Reco very", "Physi cal Healt h", etc.)
- **Fix Needed**: 
  - Change `recoveryComponentTitle` fontSize from 16 to 13
  - Add `textAlign: 'center'` to title
  - Fix `recoveryComponentGradient` to have `alignItems: 'center'`
  - Increase icon size to 48x48

### 2. Recovery Journey Section  
- **Issue**: Phase cards are trying to display horizontally but getting squished
- **Fix Needed**:
  - Remove fixed width of 23% from phase cards
  - Change to vertical layout or 2-column grid
  - Adjust padding and font sizes

### 3. Understanding Section
- **Issue**: Three items trying to display horizontally with dividers
- **Fix Needed**:
  - Change to vertical layout
  - Remove flex-direction: row
  - Adjust divider styling

### 4. Overall Styling
- Ensure all gradient backgrounds have proper borders
- Fix any shadow/elevation issues
- Ensure consistent spacing throughout

## Code Location
File: `mobile-app/src/screens/dashboard/DashboardScreen.tsx`
- Recovery Components styles: Around line 3605-3640
- Recovery Journey styles: Around line 3645-3690  
- Understanding section styles: Around line 3700-3730 