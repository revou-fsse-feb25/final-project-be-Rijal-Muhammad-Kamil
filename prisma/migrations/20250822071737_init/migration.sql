-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ATTENDEE', 'EVENT_ORGANIZER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."EventStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."PeriodStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."TicketStatus" AS ENUM ('AVAILABLE', 'SOLD_OUT');

-- CreateEnum
CREATE TYPE "public"."TRANSACTION_STATUS" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."PAYMENT_METHOD" AS ENUM ('CREDIT_CARD', 'BANK_TRANSFER', 'OVO', 'DANA', 'GOPAY');

-- CreateTable
CREATE TABLE "public"."User" (
    "user_id" SERIAL NOT NULL,
    "email" VARCHAR(51) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'ATTENDEE',
    "first_name" VARCHAR(51) NOT NULL,
    "last_name" VARCHAR(51) NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "phone_number" VARCHAR(14) NOT NULL,
    "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."EventOrganizer" (
    "organizer_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(127) NOT NULL,
    "image_url" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventOrganizer_pkey" PRIMARY KEY ("organizer_id")
);

-- CreateTable
CREATE TABLE "public"."EventCategory" (
    "category_id" SERIAL NOT NULL,
    "name" VARCHAR(51) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventCategory_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "event_id" SERIAL NOT NULL,
    "category_id" INTEGER,
    "organizer_id" INTEGER,
    "title" VARCHAR(127) NOT NULL,
    "description" TEXT NOT NULL,
    "terms" TEXT NOT NULL,
    "location" VARCHAR(127) NOT NULL,
    "image_url" VARCHAR(255) NOT NULL,
    "status" "public"."EventStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "public"."EventPeriod" (
    "period_id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "name" VARCHAR(127) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "status" "public"."PeriodStatus" NOT NULL DEFAULT 'UPCOMING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventPeriod_pkey" PRIMARY KEY ("period_id")
);

-- CreateTable
CREATE TABLE "public"."TicketTypeCategory" (
    "category_id" SERIAL NOT NULL,
    "name" VARCHAR(51) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketTypeCategory_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "public"."TicketType" (
    "type_id" SERIAL NOT NULL,
    "period_id" INTEGER NOT NULL,
    "category_id" INTEGER,
    "price" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2),
    "quota" INTEGER NOT NULL,
    "status" "public"."TicketStatus" NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketType_pkey" PRIMARY KEY ("type_id")
);

-- CreateTable
CREATE TABLE "public"."Ticket" (
    "ticket_id" SERIAL NOT NULL,
    "type_id" INTEGER NOT NULL,
    "transaction_id" INTEGER,
    "ticket_code" VARCHAR(51) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("ticket_id")
);

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "transaction_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "status" "public"."TRANSACTION_STATUS" NOT NULL DEFAULT 'PENDING',
    "payment_method" "public"."PAYMENT_METHOD" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_number_key" ON "public"."User"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "EventOrganizer_user_id_key" ON "public"."EventOrganizer"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "EventOrganizer_name_key" ON "public"."EventOrganizer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EventCategory_name_key" ON "public"."EventCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TicketTypeCategory_name_key" ON "public"."TicketTypeCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticket_code_key" ON "public"."Ticket"("ticket_code");

-- AddForeignKey
ALTER TABLE "public"."EventOrganizer" ADD CONSTRAINT "EventOrganizer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."EventCategory"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."EventOrganizer"("organizer_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventPeriod" ADD CONSTRAINT "EventPeriod_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."Event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TicketType" ADD CONSTRAINT "TicketType_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "public"."EventPeriod"("period_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TicketType" ADD CONSTRAINT "TicketType_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."TicketTypeCategory"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ticket" ADD CONSTRAINT "Ticket_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."TicketType"("type_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ticket" ADD CONSTRAINT "Ticket_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."Transaction"("transaction_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
