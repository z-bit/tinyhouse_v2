import { createConnection } from "typeorm";
import { Database } from "../lib/types";
import { ListingEntity } from "./entity";

export const connectDatabase = async (): Promise<Database> => {
  const connection = await createConnection();

  return {
    listings: connection.getRepository(ListingEntity),
  };
};
