import RenterInLogo from '../../assets/RenterIn-logo.png';

export default function Footer() {
  return (
    <footer className="bg-[#101726] text-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={RenterInLogo} alt="RenterIn Logo" className="h-12 w-auto rounded-full bg-white p-1" />
              <span className="font-bold text-2xl">RenterIn</span>
            </div>
            <div className="text-sm text-gray-400 leading-relaxed">
              Jl. Contoh No. 123, Jakarta, Indonesia<br />
              Email: <a href="mailto:info@renterin.com" className="underline hover:text-blue-400">info@renterin.com</a><br />
              Telp: <a href="tel:+628123456789" className="underline hover:text-blue-400">+62 812-3456-789</a>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-center">
            <span className="font-semibold text-gray-300 mb-2 text-lg">Navigasi</span>
            <a href="/" className="hover:text-blue-400 transition mb-1">Beranda</a>
            <a href="/properties" className="hover:text-blue-400 transition mb-1">Properti</a>
            <a href="/about" className="hover:text-blue-400 transition mb-1">Tentang</a>
            <a href="/contact" className="hover:text-blue-400 transition">Kontak</a>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-semibold text-gray-100 mb-2 text-lg">Sosial Media</span>
            <div className="flex gap-6">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
                <svg className="w-7 h-7 mb-1 group-hover:text-pink-400 transition" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" fill="none" stroke="currentColor"/>
                  <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor"/>
                  <circle cx="17" cy="7" r="1.5" fill="currentColor" />
                </svg>
                <span className="text-xs text-gray-100 group-hover:text-pink-400">Instagram</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
                <svg className="w-7 h-7 mb-1 group-hover:text-blue-400 transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 5 3.657 9.127 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33V21.877C18.343 21.127 22 17 22 12" />
                </svg>
                <span className="text-xs text-gray-100 group-hover:text-blue-400">Facebook</span>
              </a>
              <a href="https://wa.me/628123456789" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
                <svg className="w-7 h-7 mb-1 group-hover:text-green-400 transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.004 2.003a9.995 9.995 0 0 0-8.47 15.47l-1.53 4.45a1 1 0 0 0 1.27 1.27l4.45-1.53a9.995 9.995 0 1 0 4.28-19.66zm0 1.5a8.5 8.5 0 1 1 0 17 8.48 8.48 0 0 1-4.37-1.23l-.31-.19-2.64.91.91-2.64-.19-.31A8.48 8.48 0 0 1 3.5 12.003zm4.13 6.44c-.22-.11-1.3-.64-1.5-.71-.2-.07-.34-.11-.48.11-.14.22-.55.71-.67.85-.12.14-.25.16-.47.05-.22-.11-.92-.34-1.75-1.09-.65-.58-1.09-1.3-1.22-1.52-.13-.22-.01-.34.1-.45.1-.1.22-.25.33-.37.11-.12.14-.2.22-.33.07-.13.04-.25-.02-.36-.07-.11-.48-1.16-.66-1.6-.17-.44-.35-.38-.48-.39-.12-.01-.26-.01-.4-.01-.14 0-.36.05-.55.25-.19.2-.73.71-.73 1.73 0 1.02.75 2.01.85 2.15.11.14 1.48 2.27 3.6 3.09.5.2.89.32 1.2.41.5.16.95.14 1.3.09.4-.06 1.3-.53 1.48-1.04.18-.51.18-.95.13-1.04-.05-.09-.2-.14-.42-.25z"/>
                </svg>
                <span className="text-xs text-gray-100 group-hover:text-green-400">WhatsApp</span>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
                <svg className="w-7 h-7 mb-1 group-hover:text-red-500 transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.8 8.001a2.75 2.75 0 0 0-1.94-1.94C18.1 6 12 6 12 6s-6.1 0-7.86.06a2.75 2.75 0 0 0-1.94 1.94A28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .2 3.999 2.75 2.75 0 0 0 1.94 1.94C5.9 18 12 18 12 18s6.1 0 7.86-.06a2.75 2.75 0 0 0 1.94-1.94A28.6 28.6 0 0 0 22 12a28.6 28.6 0 0 0-.2-3.999zM10 15.5v-7l6 3.5-6 3.5z"/>
                </svg>
                <span className="text-xs text-gray-100 group-hover:text-red-500">YouTube</span>
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
                <svg className="w-7 h-7 mb-1 group-hover:text-indigo-400 transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.369A19.791 19.791 0 0 0 16.885 3.1a.074.074 0 0 0-.079.037c-.34.607-.719 1.396-.984 2.013a18.524 18.524 0 0 0-5.614 0 12.51 12.51 0 0 0-.995-2.013.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.369a.069.069 0 0 0-.032.027C.533 9.09-.319 13.579.099 18.021a.08.08 0 0 0 .031.056c2.104 1.547 4.13 2.489 6.102 3.104a.077.077 0 0 0 .084-.027c.472-.648.893-1.333 1.262-2.057a.076.076 0 0 0-.041-.104c-.671-.253-1.31-.558-1.927-.892a.077.077 0 0 1-.008-.128c.13-.098.26-.2.382-.304a.074.074 0 0 1 .077-.01c4.053 1.853 8.418 1.853 12.444 0a.075.075 0 0 1 .078.009c.123.104.252.206.383.304a.077.077 0 0 1-.006.128 12.298 12.298 0 0 1-1.928.892.076.076 0 0 0-.04.105c.37.724.791 1.409 1.262 2.057a.076.076 0 0 0 .084.028c1.978-.615 4.004-1.557 6.107-3.104a.077.077 0 0 0 .03-.055c.5-5.177-.838-9.637-3.548-13.625a.061.061 0 0 0-.03-.028zM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.174 1.094 2.156 2.418 0 1.334-.955 2.419-2.156 2.419zm7.974 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.174 1.094 2.156 2.418 0 1.334-.946 2.419-2.156 2.419z"/>
                </svg>
                <span className="text-xs text-gray-100 group-hover:text-indigo-400">Discord</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} RenterIn. All rights reserved.
      </div>
    </footer>
  );
}