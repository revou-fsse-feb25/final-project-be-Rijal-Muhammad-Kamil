-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ATTENDEE', 'EVENT_ORGANIZER');

-- CreateEnum
CREATE TYPE "public"."EventStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."PeriodStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."TicketTypeName" AS ENUM ('VIP', 'REGULAR', 'EARLY_BIRD');

-- CreateEnum
CREATE TYPE "public"."TicketTypeStatus" AS ENUM ('AVAILABLE', 'SOLD_OUT');

-- CreateTable
CREATE TABLE "public"."User" (
    "user_id" SERIAL NOT NULL,
    "email" VARCHAR(51) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."UserProfile" (
    "profile_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "first_name" VARCHAR(51) NOT NULL,
    "last_name" VARCHAR(51) NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "phone_number" VARCHAR(14) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'ATTENDEE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "public"."EventOrganizer" (
    "organizer_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(127) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventOrganizer_pkey" PRIMARY KEY ("organizer_id")
);

-- CreateTable
CREATE TABLE "public"."EventCategory" (
    "category_id" SERIAL NOT NULL,
    "name" VARCHAR(127) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventCategory_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "public"."EventTerms" (
    "term_id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventTerms_pkey" PRIMARY KEY ("term_id")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "event_id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "organizer_id" INTEGER NOT NULL,
    "title" VARCHAR(127) NOT NULL,
    "description" TEXT NOT NULL,
    "location" VARCHAR(127) NOT NULL,
    "image_url" VARCHAR(255) NOT NULL,
    "status" "public"."EventStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "public"."EventPeriod" (
    "period_id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "name" VARCHAR(127) NOT NULL,
    "period_sequence" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "public"."PeriodStatus" NOT NULL DEFAULT 'UPCOMING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventPeriod_pkey" PRIMARY KEY ("period_id")
);

-- CreateTable
CREATE TABLE "public"."TicketType" (
    "type_id" SERIAL NOT NULL,
    "period_id" INTEGER NOT NULL,
    "name" "public"."TicketTypeName" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "quota" INTEGER NOT NULL,
    "status" "public"."TicketTypeStatus" NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketType_pkey" PRIMARY KEY ("type_id")
);

-- CreateTable
CREATE TABLE "public"."Ticket" (
    "ticket_id" SERIAL NOT NULL,
    "type_id" INTEGER NOT NULL,
    "buyer_id" INTEGER,
    "ticket_code" VARCHAR(51) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("ticket_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_user_id_key" ON "public"."UserProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_phone_number_key" ON "public"."UserProfile"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "EventOrganizer_user_id_key" ON "public"."EventOrganizer"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "EventCategory_name_key" ON "public"."EventCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EventTerms_event_id_key" ON "public"."EventTerms"("event_id");

-- CreateIndex
CREATE INDEX "Event_category_id_idx" ON "public"."Event"("category_id");

-- CreateIndex
CREATE INDEX "Event_organizer_id_idx" ON "public"."Event"("organizer_id");

-- CreateIndex
CREATE INDEX "EventPeriod_event_id_idx" ON "public"."EventPeriod"("event_id");

-- CreateIndex
CREATE INDEX "EventPeriod_status_idx" ON "public"."EventPeriod"("status");

-- CreateIndex
CREATE INDEX "TicketType_period_id_idx" ON "public"."TicketType"("period_id");

-- CreateIndex
CREATE INDEX "TicketType_status_idx" ON "public"."TicketType"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticket_code_key" ON "public"."Ticket"("ticket_code");

-- CreateIndex
CREATE INDEX "Ticket_type_id_idx" ON "public"."Ticket"("type_id");

-- CreateIndex
CREATE INDEX "Ticket_buyer_id_idx" ON "public"."Ticket"("buyer_id");

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventOrganizer" ADD CONSTRAINT "EventOrganizer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventTerms" ADD CONSTRAINT "EventTerms_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."Event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."EventCategory"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."EventOrganizer"("organizer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventPeriod" ADD CONSTRAINT "EventPeriod_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."Event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TicketType" ADD CONSTRAINT "TicketType_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "public"."EventPeriod"("period_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ticket" ADD CONSTRAINT "Ticket_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."TicketType"("type_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ticket" ADD CONSTRAINT "Ticket_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
