// import { PayloadType } from "../utils/jwt";

import { Payload } from "@prisma/client/runtime";

// declare global {
//   namespace Express {
//     interface Request {
//       user?: PayloadType;
//     }
//   }
// }

declare module "@prisma/client/runtime" {
  type GetByUniqueInput<T> = {
    [K in keyof T]: T[K];
  };
}
