#!/bin/bash
export DATABASE_URL="postgresql://first-read:top-secret:)@localhost:5432/first-read?schema=public"
export CHECKPOINT_DISABLE=1
pnpm prisma studio 