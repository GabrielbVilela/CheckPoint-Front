import Constants from "expo-constants";

type EnvConfig = {
  apiUrl: string;
};

const readEnv = (): EnvConfig => {
  const expoExtra = Constants.expoConfig?.extra ?? {};
  const envApiUrl =
    process.env.EXPO_PUBLIC_API_URL ??
    (expoExtra.EXPO_PUBLIC_API_URL as string | undefined);

  if (!envApiUrl) {
    console.warn(
      "[env] EXPO_PUBLIC_API_URL nao foi definido; usando https://backend-expo-681689392736.us-central1.run.app"
    );
  }

  return {
    apiUrl: envApiUrl ?? "https://backend-expo-681689392736.us-central1.run.app",
  };
};

export const env = readEnv();

export const endpoints = {
  login: `${env.apiUrl}/login`,
  registro: `${env.apiUrl}/registro`,
  alunos: `${env.apiUrl}/alunos`,
} as const;

export default env;