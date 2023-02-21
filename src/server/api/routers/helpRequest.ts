import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const helpRequestRouter = createTRPCRouter({
  createHelpRequest: publicProcedure.mutation(async ({ ctx }) => {
    const helpRequest = await ctx.prisma.helpRequest.create({
      data: {},
    });
    return helpRequest;
  }),
  deleteHelpRequest: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.helpRequest.delete({
        where: {
          id: input.id,
        },
      });
    }),
  getHelpRequests: publicProcedure.query(async ({ ctx }) => {
    const helpRequests = await ctx.prisma.helpRequest.findMany();
    return helpRequests;
  }),
});
