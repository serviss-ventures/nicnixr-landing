# AI Coach Authenticity Fix

## Issue
The AI Coach was claiming personal recovery experience with statements like:
- "We've both walked down this road"
- Acting as if it had been through nicotine recovery itself

This is inappropriate because:
1. **It's dishonest** - AI hasn't experienced addiction or recovery
2. **Undermines trust** - Users may feel deceived when they realize the truth
3. **Reduces credibility** - False claims make the entire coaching feel less authentic

## The Fix

Updated the system prompt in `admin-dashboard/src/app/api/ai-coach/chat/route.ts`:

### Before:
```
You are a close friend who's been through nicotine recovery yourself...
Share like you've been there (because you have)
```

### After:
```
You are a supportive recovery coach who deeply understands the challenges...
Share insights from helping many people through recovery
```

## Key Changes:
1. ✅ Removed all claims of personal addiction/recovery experience
2. ✅ Positioned AI as an experienced coach who has helped many others
3. ✅ Added explicit instructions to never claim personal experience or make up fake stories
4. ✅ Changed examples from "helps me" to "helps a lot of people"

## Result:
The AI Coach can now be:
- **Supportive** without being deceptive
- **Understanding** through knowledge, not false claims
- **Authentic** by being honest about what it is
- **Helpful** by sharing real insights from helping others

## Testing:
After this change, the AI Coach should:
- ✅ Still be warm, friendly, and supportive
- ✅ Share helpful insights and strategies
- ❌ Never claim to have personally experienced addiction
- ❌ Never say things like "when I quit" or "in my recovery"

The coach maintains its friendly, supportive personality while being honest about its role as a knowledgeable helper, not a fellow recoverer. 