import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany({
      include: {
        goals: true,
      },
      orderBy: { name: "asc" },
    });
  }),

  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        exercise: z.string().min(1),
        target: z.number().positive(),
        unit: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.upsert({
        where: { name: input.name },
        update: {},
        create: { name: input.name },
      });

      return ctx.db.goal.create({
        data: {
          userId: user.id,
          exercise: input.exercise,
          target: input.target,
          unit: input.unit,
        },
      });
    }),
});
