import { useState, FormEvent } from 'react';
import { X, Mail, Lock, Loader2, Telescope, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function AuthModal() {
  const { setIsAuthModalOpen, login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Telescope className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-base">Connexion</h2>
              <p className="text-slate-500 text-xs">KDP Scout</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {!isSupabaseConfigured && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-amber-300 text-xs leading-relaxed">
                <strong>Mode démo :</strong> Supabase n'est pas configuré.
                Ajoutez <code className="bg-slate-800 px-1 rounded text-amber-200">VITE_SUPABASE_URL</code> et{' '}
                <code className="bg-slate-800 px-1 rounded text-amber-200">VITE_SUPABASE_ANON_KEY</code> dans votre fichier <code className="bg-slate-800 px-1 rounded text-amber-200">.env</code>.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Connexion...</>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <p className="text-center text-slate-600 text-xs mt-5">
            Pas encore de compte ?{' '}
            <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer">
              Créer un compte
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
