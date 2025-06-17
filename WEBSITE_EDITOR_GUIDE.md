# Website Page Editor Guide

## Overview

We've set up a visual page editor in the admin dashboard that allows you to edit the marketing website content without touching code. This maintains a clean codebase while giving you the flexibility to update content.

## Getting Started

### 1. Start the Development Environment

First, make sure both the admin dashboard and website are running:

```bash
# In the project root directory
npm run dev:all

# Or use the convenience script:
./start-editor.sh
```

This will start:
- Admin Dashboard: http://localhost:3000
- Marketing Website: http://localhost:3001

### 2. Access the Page Editor

1. Open the admin dashboard at http://localhost:3000
2. Navigate to "Marketing Website" in the sidebar
3. Click on the "Page Editor" tab

## Using the Page Editor

### Editor Layout

The page editor has a split-screen view:
- **Left Side**: Content editor with different sections
- **Right Side**: Live preview of the website

### Editing Content

The editor is organized into sections:

#### 1. **Navigation Settings** (NEW!)
- **Sticky Header**: Toggle to keep navigation fixed at top when scrolling
- **Transparent on Top**: Make navigation transparent at the page top
- **Show Logo**: Toggle NIXR logo visibility

When sticky header is enabled:
- Navigation stays fixed at the top while scrolling
- Background becomes dark when scrolled down
- Smooth transition effects are applied

#### 2. **Hero Section**
- **Headline**: The main bold statement (e.g., "Stay addicted.")
- **Subheadline**: Supporting text (e.g., "It's easier.")
- **Primary CTA**: Main button text (e.g., "Download")
- **Secondary CTA**: Secondary button text (e.g., "How it works")

#### 3. **Stats Section**
- **Title**: Main heading (use \n for line breaks)
- **Subtitle**: Description text
- **Success Rate**: The percentage shown (e.g., "66%")
- **Description**: Supporting text below the percentage

#### 4. **Features Section**
- **Section Title**: Overall heading for features
- **Individual Features**: Each feature has:
  - Icon (emoji)
  - Title
  - Description

#### 5. **Testimonial Section**
- **Quote**: The testimonial text
- **Author**: Attribution (e.g., "Anonymous, NIXR member")

#### 6. **CTA Section**
- **Title**: Final call-to-action heading
- **Subtitle**: Supporting text

### Making Changes

1. Click on any section tab to edit that content
2. Type your changes in the input fields
3. You'll see "You have unsaved changes" appear
4. Click "Save Changes" to apply your edits
5. The preview will automatically refresh in ~1 second

### Save Functionality (IMPROVED!)

- **Real-time file updates**: Changes now update the actual website files
- **Automatic preview refresh**: Preview iframe refreshes automatically after save
- **Visual feedback**: Loading states and success indicators
- **Persistent changes**: Updates are saved to the website source files

## Important Notes

### Current Capabilities

1. **File-based storage**: Changes are now saved to the actual website files
2. **Sticky navigation**: Full control over header behavior
3. **Live preview**: See changes immediately in the preview pane
4. **All text content**: Edit any text on the page

### Design Guidelines

1. **Keep it Minimal**: The website follows a bold, minimalist aesthetic
2. **Short & Punchy**: Use concise, impactful copy
3. **Emojis**: Use emojis sparingly for feature icons
4. **Gold Accents**: The design uses gold/amber colors for CTAs and highlights

### Tips for Your Designer

1. **Preview Different Devices**: Use the device preview selector in the "Preview" tab to see how it looks on mobile, tablet, and desktop
2. **Test Line Breaks**: Use \n in titles to control line breaks
3. **Check Hover States**: The preview shows interactive hover states on buttons and cards
4. **Keep Consistency**: Maintain the edgy, direct tone throughout
5. **Test Sticky Header**: Scroll in the preview to see how sticky navigation behaves

## Troubleshooting

### Preview not updating?
1. Make sure you clicked "Save Changes"
2. Wait 1-2 seconds for the refresh
3. If still not updating, refresh the entire admin page

### Changes not persisting?
1. Ensure both servers are running (admin + website)
2. Check console for any error messages
3. Verify file permissions in the project directory

## Future Enhancements

We can add:
- Image upload and management
- Rich text editing
- Color/theme customization
- Multiple page support
- Version history
- Database persistence

## Need Help?

If you need any features added or run into issues, let us know and we can enhance the editor to meet your needs while maintaining clean code architecture. 