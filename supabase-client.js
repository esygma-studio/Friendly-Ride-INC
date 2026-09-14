(function () {
  'use strict';

  // Publishable anon key — safe to ship in client-side code. Row Level
  // Security policies in the database (see supabase-schema.sql) are what
  // actually restrict each signed-in user to their own profile/addresses,
  // not secrecy of this key.
  var SUPABASE_URL = 'https://kgcocdxaybjhmxgfvadz.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_PME_FhvGiRt5AlAjZViOcw_Lbf5rYOL';

  if (!window.supabase || !window.supabase.createClient) {
    console.warn('Supabase client library failed to load — accounts and saved addresses are disabled.');
    return;
  }

  window.frlSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();
