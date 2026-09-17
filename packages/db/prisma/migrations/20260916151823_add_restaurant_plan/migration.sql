-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'PREMIUM');

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE';
