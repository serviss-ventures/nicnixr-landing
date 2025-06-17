"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, Button } from '@/components';
import { Save, RefreshCw, Edit3, Type, Image, FileText, Settings } from 'lucide-react';

interface WebsiteContent {
  navigation: {
    sticky: boolean;
    transparentOnTop: boolean;
    showLogo: boolean;
  };
  hero: {
    headline: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  stats: {
    title: string;
    subtitle: string;
    successRate: string;
    description: string;
  };
  features: {
    title: string;
    items: Array<{
      id: string;
      icon: string;
      title: string;
      description: string;
    }>;
  };
  testimonial: {
    quote: string;
    author: string;
  };
  cta: {
    title: string;
    subtitle: string;
  };
}

export default function ContentEditor() {
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [hasChanges, setHasChanges] = useState(false);

  // Load content on mount
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/website/content');
      const data = await response.json();
      if (data.success) {
        setContent(data.content);
      }
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveContent = async () => {
    if (!content) return;
    
    setIsSaving(true);
    try {
      console.log('Saving content:', content); // Debug log
      
      const response = await fetch('/api/website/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      
      const result = await response.json();
      console.log('Save result:', result); // Debug log
      
      if (response.ok && result.fileUpdated) {
        setHasChanges(false);
        
        // Wait a bit for file write to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Force refresh all iframes to show updated content
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          const src = iframe.src;
          iframe.src = 'about:blank';
          setTimeout(() => {
            iframe.src = src;
          }, 100);
        });
      } else {
        console.error('Save failed:', result);
        alert('Failed to save changes. Check console for details.');
      }
    } catch (error) {
      console.error('Failed to save content:', error);
      alert('Error saving changes. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateContent = (section: string, field: string, value: string) => {
    if (!content) return;
    
    setContent({
      ...content,
      [section]: {
        ...content[section as keyof WebsiteContent],
        [field]: value
      }
    });
    setHasChanges(true);
  };

  const updateFeature = (index: number, field: string, value: string) => {
    if (!content) return;
    
    const newFeatures = [...content.features.items];
    newFeatures[index] = {
      ...newFeatures[index],
      [field]: value
    };
    
    setContent({
      ...content,
      features: {
        ...content.features,
        items: newFeatures
      }
    });
    setHasChanges(true);
  };

  if (isLoading || !content) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-6 w-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Navigation Header */}
      <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {['navigation', 'hero', 'stats', 'features', 'testimonial', 'cta'].map((section) => (
              <Button
                key={section}
                variant={activeSection === section ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveSection(section)}
                className="text-xs sm:text-sm"
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {hasChanges && (
              <span className="text-sm text-amber-500 hidden lg:inline">
                You have unsaved changes
              </span>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={saveContent}
              disabled={!hasChanges || isSaving}
              className="w-full lg:w-auto min-w-[140px]"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
        
        {/* Mobile/Tablet unsaved changes indicator */}
        {hasChanges && (
          <div className="text-sm text-amber-500 text-center lg:hidden mt-3">
            You have unsaved changes
          </div>
        )}
      </div>

      {/* Navigation Settings */}
      {activeSection === 'navigation' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Navigation Settings
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                <div>
                  <label className="font-medium">Sticky Header</label>
                  <p className="text-sm text-white/60 mt-1">Keep navigation fixed at top when scrolling</p>
                </div>
                <button
                  onClick={() => updateContent('navigation', 'sticky', !content.navigation.sticky)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    content.navigation.sticky ? 'bg-amber-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      content.navigation.sticky ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                <div>
                  <label className="font-medium">Transparent on Top</label>
                  <p className="text-sm text-white/60 mt-1">Make navigation transparent at the top of page</p>
                </div>
                <button
                  onClick={() => updateContent('navigation', 'transparentOnTop', !content.navigation.transparentOnTop)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    content.navigation.transparentOnTop ? 'bg-amber-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      content.navigation.transparentOnTop ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                <div>
                  <label className="font-medium">Show Logo</label>
                  <p className="text-sm text-white/60 mt-1">Display NIXR logo in navigation</p>
                </div>
                <button
                  onClick={() => updateContent('navigation', 'showLogo', !content.navigation.showLogo)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    content.navigation.showLogo ? 'bg-amber-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      content.navigation.showLogo ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero Section Editor */}
      {activeSection === 'hero' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Type className="h-5 w-5" />
              Hero Section
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Headline</label>
              <input
                type="text"
                value={content.hero.headline}
                onChange={(e) => updateContent('hero', 'headline', e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subheadline</label>
              <input
                type="text"
                value={content.hero.subheadline}
                onChange={(e) => updateContent('hero', 'subheadline', e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500/50 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Primary CTA</label>
                <input
                  type="text"
                  value={content.hero.ctaPrimary}
                  onChange={(e) => updateContent('hero', 'ctaPrimary', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Secondary CTA</label>
                <input
                  type="text"
                  value={content.hero.ctaSecondary}
                  onChange={(e) => updateContent('hero', 'ctaSecondary', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500/50 focus:outline-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Section Editor */}
      {activeSection === 'stats' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Stats Section</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title (use \n for line breaks)</label>
              <textarea
                value={content.stats.title}
                onChange={(e) => updateContent('stats', 'title', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <textarea
                value={content.stats.subtitle}
                onChange={(e) => updateContent('stats', 'subtitle', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500/50 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Success Rate</label>
                <input
                  type="text"
                  value={content.stats.successRate}
                  onChange={(e) => updateContent('stats', 'successRate', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={content.stats.description}
                  onChange={(e) => updateContent('stats', 'description', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500/50 focus:outline-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Section Editor */}
      {activeSection === 'features' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Features Section</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Section Title</label>
              <input
                type="text"
                value={content.features.title}
                onChange={(e) => updateContent('features', 'title', e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500/50 focus:outline-none"
              />
            </div>
            
            <div className="space-y-4 mt-6">
              {content.features.items.map((feature, index) => (
                <div key={feature.id} className="p-4 bg-white/[0.02] rounded-lg space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Icon</label>
                      <input
                        type="text"
                        value={feature.icon}
                        onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500/50 focus:outline-none text-center text-2xl"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => updateFeature(index, 'title', e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500/50 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={feature.description}
                      onChange={(e) => updateFeature(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500/50 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testimonial Section Editor */}
      {activeSection === 'testimonial' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Testimonial Section</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quote</label>
              <textarea
                value={content.testimonial.quote}
                onChange={(e) => updateContent('testimonial', 'quote', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Author</label>
              <input
                type="text"
                value={content.testimonial.author}
                onChange={(e) => updateContent('testimonial', 'author', e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500/50 focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA Section Editor */}
      {activeSection === 'cta' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Call to Action Section</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={content.cta.title}
                onChange={(e) => updateContent('cta', 'title', e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={content.cta.subtitle}
                onChange={(e) => updateContent('cta', 'subtitle', e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500/50 focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 