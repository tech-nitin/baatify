'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { User } from 'next-auth';

function Navbar() {
  const { data: session } = useSession();

  const user: User | undefined = session?.user;

  return (
    <nav className="sticky top-0 z-50 border-b bg-slate-950 text-white">

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">

        {/* Logo */}

        <Link
          href="/"
          className="text-2xl font-bold"
        >
          True Feedback
        </Link>

        {session ? (

          <div className="flex items-center gap-6">

            <p className="hidden md:block text-sm text-slate-300">

              Welcome,

              {' '}

              <span className="font-semibold text-white">

                {user?.username || user?.email}

              </span>

            </p>

            <button

              onClick={() => signOut()}

              className="
              rounded-md
              bg-white
              px-4
              py-2
              text-sm
              font-medium
              text-black
              transition
              hover:bg-slate-200
              "

            >

              Logout

            </button>

          </div>

        ) : (

          <Link href="/sign-in">

            <button

              className="
              rounded-md
              bg-white
              px-4
              py-2
              text-sm
              font-medium
              text-black
              transition
              hover:bg-slate-200
              "

            >

              Login

            </button>

          </Link>

        )}

      </div>

    </nav>
  );
}

export default Navbar;