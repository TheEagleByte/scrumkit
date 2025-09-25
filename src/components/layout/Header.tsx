"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuth } from "@/hooks/use-auth";
import Magnet from "@/components/Magnet";
import GithubIcon from "@/components/GithubIcon";

interface HeaderProps {
  showAuth?: boolean;
}

export function Header({ showAuth = true }: HeaderProps) {
  const { user, profile, isLoading } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/5">
      <div className="container max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg" aria-hidden="true" />
          <span className="font-semibold text-lg">ScrumKit</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-gray-400 hover:text-white transition">
            Features
          </Link>
          <Link href="#integrations" className="text-gray-400 hover:text-white transition">
            Integrations
          </Link>
          <a
            href="https://github.com/scrumkit/scrumkit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition flex items-center gap-1"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>

        {showAuth && (
          <div className="flex items-center gap-4">
            {!isLoading && (
              <>
                {user ? (
                  <>
                    <Link href="/retro">
                      <Button variant="ghost" className="text-gray-400 hover:text-white">
                        Dashboard
                      </Button>
                    </Link>
                    <UserMenu user={user} profile={profile} />
                  </>
                ) : (
                  <>
                    <Link href="/auth">
                      <Button variant="ghost" className="text-gray-400 hover:text-white">
                        Sign In
                      </Button>
                    </Link>
                    <Magnet padding={50} magnetStrength={4}>
                      <Link href="/retro">
                        <Button className="bg-white text-black hover:bg-gray-200 font-medium">
                          Start Free
                        </Button>
                      </Link>
                    </Magnet>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}