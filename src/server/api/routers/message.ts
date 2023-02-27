import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const messageRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        id: z.string(), //This id refers to the helpRequest id
        message: z.string(),
        isClient: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.prisma.message.create({
        data: {
          message: input.message,
          isClient: input.isClient,
          HelpRequest: { connect: { id: input.id } },
        },
      });
      return message;
    }),
  getMessages: publicProcedure.query(async ({ ctx }) => {
    const messages = await ctx.prisma.message.findMany();
    return messages;
  }),

  /*I want to filter based on the HelpRequest */
  getMessagesByHelpRequestId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const messages = await ctx.prisma.message.findMany({
        where: {
          helpRequestId: input,
        },
      });
      return messages;
    }),
});
