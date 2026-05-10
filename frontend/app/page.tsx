import Link from "next/link";
import Image from "next/image";
import "./globals.css";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center px-6">
      <main className="w-full max-w-5xl bg-white rounded-3xl shadow-xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-12">
        
        {/* Left Side */}
        <div className="flex-1 space-y-6">
          <h1 className="text-5xl font-bold leading-tight text-zinc-900">
            Easy & Secure <br /> Money Transfer
          </h1>

          <p className="text-lg text-zinc-600 leading-8">
            Send money instantly anywhere with a fast, secure and modern
            payment experience.
          </p>

          <div className="flex gap-4">
            <Link href="/transfer">
              <button className="px-6 py-3 rounded-full bg-black text-white font-medium hover:bg-zinc-800 transition">
                Transfer Now
              </button>
            </Link>

            <button className="px-6 py-3 rounded-full border border-zinc-300 hover:bg-zinc-100 transition">
              Learn More
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 flex justify-center">
          <Image
            src="/hero.png"
            alt="Money Transfer"
            width={500}
            height={500}
            className="w-full max-w-md"
            priority
          />
        </div>
      </main>
    </div>
  );
}