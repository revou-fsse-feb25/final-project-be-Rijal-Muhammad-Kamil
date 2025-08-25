-- AlterTable
ALTER TABLE "public"."EventPeriod" ALTER COLUMN "start_date" SET DATA TYPE TEXT,
ALTER COLUMN "end_date" SET DATA TYPE TEXT,
ALTER COLUMN "start_time" SET DATA TYPE TEXT,
ALTER COLUMN "end_time" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "date_of_birth" SET DATA TYPE TEXT;
