# Nicotine Pouches Calculation Fix

## Problem Summary
User reported: "I use 10 nicotine pouches per day. Units Avoided Calculator correctly shows 30 pouches avoided after 3 days. However, Money Saved Modal incorrectly shows '1 pouch per day at $5/day'."

## Root Causes Identified

### 1. Wrong Unit Display
- **Issue**: Money Saved Modal was showing individual units (pouches) instead of packages (tins)
- **Code**: `{dailyAmount} {productDetails.unit}` was showing "1 pouch" instead of "0.67 tins"
- **Fix**: Changed to use `productDetails.packageName` / `productDetails.packageNamePlural`

### 2. Missing Tins Calculation
- **Issue**: If user only has `dailyAmount` (pouches) but not `tinsPerDay`, the system defaulted to 0.5 tins
- **Code**: `return userProfile?.tinsPerDay || 0.5;`
- **Fix**: Added fallback calculation: `userProfile.dailyAmount / 15`

### 3. Poor Number Formatting
- **Issue**: Always showing 2 decimal places (e.g., "1.00 tins")
- **Fix**: Smart formatting: whole numbers show no decimals, fractional values show appropriate precision

## Changes Made

### 1. MoneySavedModal.tsx
```typescript
// Fixed unit display (line ~173)
{dailyAmount < 1 ? dailyAmount.toFixed(2) : dailyAmount % 1 === 0 ? dailyAmount.toFixed(0) : dailyAmount.toFixed(1)} {dailyAmount === 1 ? productDetails.packageName : productDetails.packageNamePlural} per day

// Fixed section title (line ~187)
UPDATE YOUR COST PER {productDetails.packageName.toUpperCase()}

// Added debug logging
if (productCategory === 'pouches') {
  console.log('🔍 Pouches Money Saved Debug:', {...});
  console.log('💰 Pouches Cost Debug:', {...});
}
```

### 2. nicotineProducts.ts
```typescript
case 'pouches':
  // If tinsPerDay is set, use it
  if (userProfile?.tinsPerDay !== undefined) {
    return userProfile.tinsPerDay;
  }
  // Otherwise calculate from dailyAmount (pouches per day)
  if (userProfile?.dailyAmount !== undefined) {
    return userProfile.dailyAmount / 15; // 15 pouches per tin
  }
  // Default fallback
  return 0.5;
```

## Expected Behavior After Fix

### Example: 10 pouches/day user
1. **Units Avoided Calculator**: "30 pouches" after 3 days ✓
2. **Money Saved Modal**: "0.67 tins per day" (not "1 pouch per day")
3. **Cost Input**: "UPDATE YOUR COST PER TIN"
4. **Calculation**: If tin costs $7.50, daily cost = 0.67 × $7.50 = $5.00

### Data Flow
```
User Input: 10 pouches/day
↓
Stored as: dailyAmount: 10
↓
getDailyPackages(): 10 ÷ 15 = 0.67 tins
↓
Display: "0.67 tins per day"
↓
Cost: 0.67 tins × $7.50/tin = $5.00/day
↓
3 days: $5.00 × 3 = $15.00 saved
```

## Testing Instructions

1. **Create new user** with nicotine pouches (10 pouches/day)
2. **Check Units Avoided**: Should show individual pouches
3. **Check Money Saved**: Should show "0.67 tins per day"
4. **Update cost**: Enter cost per tin (e.g., $7.50)
5. **Verify calculation**: Daily cost should be ~$5.00

## Debug Output
The console will show:
- 🔍 Pouches Money Saved Debug: Shows user data structure
- 💰 Pouches Cost Debug: Shows cost calculations

Remove debug logging after verification. 