import NextAuth from "next-auth"
import Credientials from 'next-auth/providers/credentials'
import { loginUser } from "./app/utils/user"

import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
import { DynamoDBAdapter } from "@auth/dynamodb-adapter"

const config: DynamoDBClientConfig = {
  credentials: {
    accessKeyId: process.env.AUTH_DYNAMODB_ID,
    secretAccessKey: process.env.AUTH_DYNAMODB_SECRET,
  },
  region: process.env.AUTH_DYNAMODB_REGION,
}

const client = DynamoDBDocument.from(new DynamoDB(config), {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credientials({
      credentials: {
        userID: {},
      },
      authorize: async (credientials) => {
        let user = null

        user = await loginUser(credientials.userID as string)

        if (!user) {
          throw new Error('Invalid credientials.')
        }

        return user
      }
    })
  ],
  adapter: DynamoDBAdapter(client),
})
