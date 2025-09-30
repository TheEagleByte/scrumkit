"use client";

import Link from "next/link";
import Image from "next/image";
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
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.svg"
            alt="ScrumKit"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="font-semibold text-lg">ScrumKit</span>
        </Link>

        {showAuth && (
          <div className="flex items-center gap-4">
            {!isLoading && (
              <>
                {user ? (
                  <>
                    <Link href="/dashboard">
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
                      <Link href="/dashboard">
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