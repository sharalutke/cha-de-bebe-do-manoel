import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

import { createClient } from "@supabase/supabase-js";

const envPath = resolve(process.cwd(), process.argv[2] ?? "admin.env.local");

function loadEnvFile(path) {
  if (!existsSync(path)) {
    throw new Error(`Arquivo de ambiente nao encontrado: ${path}`);
  }

  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    if (process.env[key]) {
      continue;
    }

    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Preencha ${name} em ${envPath}`);
  }
  return value;
}

async function findUserByEmail(supabase, email) {
  const normalizedEmail = email.toLowerCase();

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      throw error;
    }

    const users = data?.users ?? [];
    const user = users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail);
    if (user) {
      return user;
    }

    if (users.length < 1000) {
      return null;
    }
  }

  throw new Error("Nao consegui procurar todos os usuarios; confira manualmente no dashboard.");
}

async function main() {
  loadEnvFile(envPath);

  const supabaseUrl = requiredEnv("SUPABASE_URL");
  const secretKey =
    process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const email = requiredEnv("ADMIN_EMAIL");
  const password = requiredEnv("ADMIN_PASSWORD");
  const displayName = process.env.ADMIN_DISPLAY_NAME?.trim() || "Administrador";

  if (!secretKey) {
    throw new Error(`Preencha SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY em ${envPath}`);
  }

  if (secretKey.startsWith("sb_publishable_")) {
    throw new Error("Voce colou a publishable/anon key. Aqui precisa da secret key ou service_role key.");
  }

  const supabase = createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const existingUser = await findUserByEmail(supabase, email);
  let user = existingUser;

  if (existingUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
      user_metadata: { name: displayName },
    });

    if (error) {
      throw error;
    }

    user = data.user;
    console.log(`Usuario existente atualizado: ${email}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: displayName },
    });

    if (error) {
      throw error;
    }

    user = data.user;
    console.log(`Usuario criado: ${email}`);
  }

  if (!user?.id) {
    throw new Error("Supabase nao retornou o ID do usuario.");
  }

  const { error: profileError } = await supabase.from("admin_profiles").upsert(
    {
      user_id: user.id,
      email,
      display_name: displayName,
    },
    { onConflict: "user_id" },
  );

  if (profileError) {
    throw profileError;
  }

  console.log(`Admin liberado: ${email}`);
  console.log("Agora teste no /admin do site publicado.");
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exitCode = 1;
});
