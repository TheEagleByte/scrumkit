"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedLogo from "@/components/AnimatedLogo";

export default function LogoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">ScrumKit Logo</h1>
          <p className="text-muted-foreground">Logo specifications and usage examples</p>
        </div>

        {/* Animated Logo Showcase */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Animated Logo</h2>
          <p className="text-muted-foreground mb-8">
            The logo animation tells the story of breaking down work into smaller pieces - perfect for sprint planning and retrospectives.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Dark Background */}
            <div className="p-12 rounded-2xl bg-black border border-border flex flex-col items-center justify-center">
              <AnimatedLogo size={200} autoPlay={true} loop={true} />
              <p className="text-sm text-gray-400 mt-4">Animated - Dark Background</p>
            </div>

            {/* Light Background */}
            <div className="p-12 rounded-2xl bg-white border border-border flex flex-col items-center justify-center">
              <AnimatedLogo size={200} autoPlay={true} loop={true} />
              <p className="text-sm text-gray-600 mt-4">Animated - Light Background</p>
            </div>
          </div>
          <div className="mt-6 p-6 rounded-xl bg-muted/50 border border-border">
            <h3 className="font-semibold mb-3">Animation Stages:</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">1.</span>
                <span>Starts as a single large square representing the whole project</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">2.</span>
                <span>Splits into 4 quadrants representing sprint planning breakdown</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">3.</span>
                <span>Bottom-right quadrant further splits into smaller tasks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">4.</span>
                <span>Final logo represents fully broken-down, actionable work items</span>
              </li>
            </ol>
          </div>
        </section>

        {/* Main Logo Showcase */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Static Logo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Dark Background */}
            <div className="p-12 rounded-2xl bg-black border border-border flex flex-col items-center justify-center">
              <Image
                src="/logo.svg"
                alt="ScrumKit Logo"
                width={200}
                height={200}
                className="mb-4"
              />
              <p className="text-sm text-gray-400">On Dark Background</p>
            </div>

            {/* Light Background */}
            <div className="p-12 rounded-2xl bg-white border border-border flex flex-col items-center justify-center">
              <Image
                src="/logo.svg"
                alt="ScrumKit Logo"
                width={200}
                height={200}
                className="mb-4"
              />
              <p className="text-sm text-gray-600">On Light Background</p>
            </div>
          </div>
        </section>

        {/* Size Variations */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Size Variations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { size: 16, label: "16px - Favicon" },
              { size: 32, label: "32px - Nav Bar" },
              { size: 64, label: "64px - Cards" },
              { size: 128, label: "128px - Hero" },
            ].map(({ size, label }) => (
              <div key={size} className="p-8 rounded-xl bg-card border border-border flex flex-col items-center justify-center gap-4">
                <Image
                  src="/logo.svg"
                  alt="ScrumKit Logo"
                  width={size}
                  height={size}
                />
                <p className="text-xs text-muted-foreground text-center">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Logo with Text */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Logo with Text</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Small */}
            <div className="p-8 rounded-xl bg-card border border-border flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.svg"
                  alt="ScrumKit"
                  width={24}
                  height={24}
                />
                <span className="font-semibold text-base">ScrumKit</span>
              </div>
              <p className="text-xs text-muted-foreground">Small (24px)</p>
            </div>

            {/* Medium */}
            <div className="p-8 rounded-xl bg-card border border-border flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.svg"
                  alt="ScrumKit"
                  width={32}
                  height={32}
                />
                <span className="font-semibold text-lg">ScrumKit</span>
              </div>
              <p className="text-xs text-muted-foreground">Medium (32px)</p>
            </div>

            {/* Large */}
            <div className="p-8 rounded-xl bg-card border border-border flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-4">
                <Image
                  src="/logo.svg"
                  alt="ScrumKit"
                  width={48}
                  height={48}
                />
                <span className="font-semibold text-2xl">ScrumKit</span>
              </div>
              <p className="text-xs text-muted-foreground">Large (48px)</p>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { color: "#9333ea", name: "Purple 600" },
              { color: "#8b5cf6", name: "Violet 500" },
              { color: "#7c3aed", name: "Violet 600" },
              { color: "#6d28d9", name: "Violet 700" },
              { color: "#5b21b6", name: "Violet 800" },
              { color: "#4c1d95", name: "Violet 900" },
            ].map(({ color, name }) => (
              <div key={color} className="p-4 rounded-xl bg-card border border-border">
                <div
                  className="w-full h-20 rounded-lg mb-3"
                  style={{ backgroundColor: color }}
                />
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground font-mono">{color}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Usage Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Do's */}
            <div className="p-8 rounded-xl bg-green-500/10 border border-green-500/20">
              <h3 className="text-xl font-semibold text-green-400 mb-4">✓ Do</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>Use the logo with adequate clear space around it</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>Maintain the aspect ratio when scaling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>Use the SVG format for best quality</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>Place on contrasting backgrounds for visibility</span>
                </li>
              </ul>
            </div>

            {/* Don'ts */}
            <div className="p-8 rounded-xl bg-red-500/10 border border-red-500/20">
              <h3 className="text-xl font-semibold text-red-400 mb-4">✗ Don&apos;t</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>Distort or stretch the logo disproportionately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>Change the colors or gradients</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>Add effects like drop shadows or outlines</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>Place on busy or low-contrast backgrounds</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Download Assets</h2>
          <div className="p-8 rounded-xl bg-card border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Logo SVG</p>
                  <p className="text-sm text-muted-foreground">Vector format, scalable</p>
                </div>
                <a href="/logo.svg" download="scrumkit-logo.svg">
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </a>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Logo PNG</p>
                  <p className="text-sm text-muted-foreground">Raster format, 512×512px</p>
                </div>
                <a href="/logo.png" download="scrumkit-logo.png">
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specs */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Technical Specifications</h2>
          <div className="p-8 rounded-xl bg-card border border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-2">Format</h3>
                <p className="text-sm text-muted-foreground">SVG (Scalable Vector Graphics)</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Dimensions</h3>
                <p className="text-sm text-muted-foreground">512×512px (viewBox)</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">File Size</h3>
                <p className="text-sm text-muted-foreground">~3KB (SVG)</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Border Radius</h3>
                <p className="text-sm text-muted-foreground">8px - 24px (responsive)</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Color Space</h3>
                <p className="text-sm text-muted-foreground">RGB with gradients</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Minimum Size</h3>
                <p className="text-sm text-muted-foreground">16×16px</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}