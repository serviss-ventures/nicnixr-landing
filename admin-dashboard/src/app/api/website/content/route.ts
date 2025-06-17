import { NextRequest, NextResponse } from 'next/server';
import { getContent, updateContent, type WebsiteContent } from '@/lib/websiteContent';
import fs from 'fs/promises';
import path from 'path';

// Update the actual website file with new content
async function updateWebsiteFile(content: WebsiteContent) {
  try {
    // Path to the website's page.tsx
    const websitePath = path.join(process.cwd(), '..', 'src', 'app', 'page.tsx');
    
    // Read the current file
    let fileContent = await fs.readFile(websitePath, 'utf-8');
    
    // 1. UPDATE NAVIGATION SETTINGS
    // Update sticky navigation class
    if (content.navigation.sticky) {
      // Make sure navigation is fixed
      fileContent = fileContent.replace(
        /<nav className=\{`(fixed|absolute)/,
        '<nav className={`fixed'
      );
    } else {
      // Make navigation absolute
      fileContent = fileContent.replace(
        /<nav className=\{`(fixed|absolute)/,
        '<nav className={`absolute'
      );
    }
    
    // Update transparent on top behavior
    if (content.navigation.transparentOnTop) {
      // Keep the scroll-based transparency
      fileContent = fileContent.replace(
        /scrolled \? 'bg-black\/90 backdrop-blur-md' : ''/,
        `scrolled ? 'bg-black/90 backdrop-blur-md' : ''`
      );
    } else {
      // Always have background
      fileContent = fileContent.replace(
        /scrolled \? 'bg-black\/90 backdrop-blur-md' : ''/,
        `'bg-black/90 backdrop-blur-md'`
      );
    }
    
    // Update logo visibility
    if (!content.navigation.showLogo) {
      fileContent = fileContent.replace(
        /<div className="text-2xl font-extralight tracking-wider">\s*NIXR\s*<\/div>/,
        '<div className="text-2xl font-extralight tracking-wider hidden">NIXR</div>'
      );
    } else {
      fileContent = fileContent.replace(
        /<div className="text-2xl font-extralight tracking-wider hidden">\s*NIXR\s*<\/div>/,
        '<div className="text-2xl font-extralight tracking-wider">NIXR</div>'
      );
    }
    
    // 2. UPDATE HERO SECTION
    // Update headline - use a more flexible regex
    fileContent = fileContent.replace(
      /<h1 className="text-6xl md:text-8xl lg:text-9xl font-extralight leading-none mb-4">[^<]*<\/h1>/,
      `<h1 className="text-6xl md:text-8xl lg:text-9xl font-extralight leading-none mb-4">
            ${content.hero.headline}
          </h1>`
    );
    
    // Update subheadline
    fileContent = fileContent.replace(
      /<p className="text-2xl md:text-3xl font-extralight opacity-70">[^<]*<\/p>/,
      `<p className="text-2xl md:text-3xl font-extralight opacity-70">
            ${content.hero.subheadline.replace(/'/g, '&apos;')}
          </p>`
    );
    
    // Update CTAs - more flexible matching
    const ctaReplacements = [
      { pattern: />Download</, replacement: `>${content.hero.ctaPrimary}<` },
      { pattern: /<span className="text-lg">▶<\/span>\s*[^<]+/, replacement: `<span className="text-lg">▶</span> ${content.hero.ctaSecondary}` }
    ];
    
    ctaReplacements.forEach(({ pattern, replacement }) => {
      fileContent = fileContent.replace(new RegExp(pattern, 'g'), replacement);
    });
    
    // 3. UPDATE STATS SECTION
    // Update title - handle line breaks properly
    const statsTitle = content.stats.title.replace(/\n/g, '<br />');
    fileContent = fileContent.replace(
      /<h2 className="text-5xl md:text-6xl font-extralight leading-tight mb-4">[^<]*(?:<br \/>)?[^<]*<\/h2>/,
      `<h2 className="text-5xl md:text-6xl font-extralight leading-tight mb-4">
              ${statsTitle}
            </h2>`
    );
    
    // Update subtitle
    fileContent = fileContent.replace(
      /<p className="text-lg font-light opacity-60 mb-8">[^<]*<\/p>/,
      `<p className="text-lg font-light opacity-60 mb-8">
              ${content.stats.subtitle.replace(/'/g, '&apos;')}
            </p>`
    );
    
    // Update success rate
    fileContent = fileContent.replace(
      /<span className="text-6xl font-extralight bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">[^<]*<\/span>/,
      `<span className="text-6xl font-extralight bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">${content.stats.successRate}</span>`
    );
    
    // Update description
    fileContent = fileContent.replace(
      /<p className="text-sm font-light opacity-50">\s*Our members[^<]*<\/p>/,
      `<p className="text-sm font-light opacity-50">
              ${content.stats.description}
            </p>`
    );
    
    // 4. UPDATE FEATURES SECTION
    // Update features title
    fileContent = fileContent.replace(
      /<h3 className="text-4xl md:text-5xl font-extralight text-center mb-16">[^<]*<\/h3>/,
      `<h3 className="text-4xl md:text-5xl font-extralight text-center mb-16">
            ${content.features.title}
          </h3>`
    );
    
    // Update each feature
    content.features.items.forEach((feature, index) => {
      // Create a pattern to match each feature block
      const featurePattern = new RegExp(
        `<div className="text-3xl mb-4">[^<]*<\/div>\\s*<h4 className="text-xl font-light mb-3">[^<]*<\/h4>\\s*<p className="text-sm font-light opacity-60 leading-relaxed">[^<]*<\/p>`,
        'g'
      );
      
      // Replace with new content
      const newFeatureBlock = `<div className="text-3xl mb-4">${feature.icon}</div>
                <h4 className="text-xl font-light mb-3">${feature.title}</h4>
                <p className="text-sm font-light opacity-60 leading-relaxed">
                  ${feature.description.replace(/'/g, '&apos;')}
                </p>`;
      
      // Find all feature blocks and replace the one at this index
      let featureIndex = 0;
      fileContent = fileContent.replace(featurePattern, (match) => {
        if (featureIndex === index) {
          featureIndex++;
          return newFeatureBlock;
        }
        featureIndex++;
        return match;
      });
    });
    
    // 5. UPDATE TESTIMONIAL
    // Update quote
    fileContent = fileContent.replace(
      /<blockquote className="text-3xl md:text-4xl font-extralight leading-relaxed mb-8">\s*"[^"]*"\s*<\/blockquote>/,
      `<blockquote className="text-3xl md:text-4xl font-extralight leading-relaxed mb-8">
            "${content.testimonial.quote}"
          </blockquote>`
    );
    
    // Update author
    fileContent = fileContent.replace(
      /<cite className="text-sm font-light opacity-50 not-italic">[^<]*<\/cite>/,
      `<cite className="text-sm font-light opacity-50 not-italic">
            — ${content.testimonial.author}
          </cite>`
    );
    
    // 6. UPDATE CTA SECTION
    // Update title
    fileContent = fileContent.replace(
      /<h2 className="text-5xl md:text-7xl font-extralight mb-8">[^<]*<\/h2>/g,
      (match, offset) => {
        // Only replace the last occurrence (final CTA)
        const remainingContent = fileContent.substring(offset);
        if (remainingContent.includes('<h2 className="text-5xl md:text-7xl font-extralight mb-8">')) {
          return match; // Not the last one
        }
        return `<h2 className="text-5xl md:text-7xl font-extralight mb-8">
          ${content.cta.title}
        </h2>`;
      }
    );
    
    // Update subtitle
    fileContent = fileContent.replace(
      /<p className="text-sm font-light opacity-50">\s*Free to try[^<]*<\/p>/,
      `<p className="text-sm font-light opacity-50">
          ${content.cta.subtitle}
        </p>`
    );
    
    // Write the updated content back
    await fs.writeFile(websitePath, fileContent, 'utf-8');
    
    console.log('Website file updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating website file:', error);
    return false;
  }
}

// Helper function to escape regex special characters
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper to get feature description by ID
function getFeatureDescriptionByTitle(id: string): string {
  const descriptions = {
    'ai-coach': 'Not another chatbot',
    'health': 'Watch your lungs clear',
    'community': 'No judgment',
    'shield': 'When cravings hit hard',
    'milestones': 'Every hour matters',
    'privacy': 'No real names'
  };
  return descriptions[id] || '';
}

export async function GET() {
  try {
    const content = getContent();
    return NextResponse.json({ success: true, content });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    const updatedContent = updateContent(content as WebsiteContent);
    
    // Update the actual website file
    const fileUpdated = await updateWebsiteFile(updatedContent);
    
    return NextResponse.json({ 
      success: true, 
      content: updatedContent,
      fileUpdated 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update content' },
      { status: 500 }
    );
  }
} 