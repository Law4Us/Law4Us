import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ cacheDir: '/Users/dortagger/Law4Us/tina/__generated__/.cache/1762543731828', url: 'http://localhost:4001/graphql', token: 'undefined', queries,  });
export default client;
  