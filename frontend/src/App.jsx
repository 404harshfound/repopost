import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Generator from "./pages/Generator";

export default function App() {
  const [page, setPage] = useState("landing");
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setPage("generator");
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setPage("generator");
      else setPage("landing");
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#f5f3f0]" />;
  }

  return (
    <>
      {page === "landing" && <Landing onNavigate={setPage} />}
      {page === "auth" && <Auth onNavigate={setPage} />}
      {page === "generator" && (
        <Generator onNavigate={setPage} session={session} />
      )}
    </>
  );
}
