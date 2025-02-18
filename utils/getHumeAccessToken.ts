import "server-only";
import { fetchAccessToken } from "@humeai/voice";

export const getHumeAccessToken = async () => {
  const accessToken = await fetchAccessToken({
    apiKey: "FvYAtfVRPUFOGpsUSXyZDfwN70TsMMFc3lNhmyk5uz7sNCrK",
    secretKey:
      "2bQhZIXSTAre0hbV4q7DpAtHSOUE3eQdCrOw1aTaKrZO0fVJwe86gHnNAymIdpgO",
  });

  if (accessToken === "undefined") {
    return null;
  }

  return accessToken ?? null;
};
