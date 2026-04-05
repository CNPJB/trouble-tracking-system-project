-- CreateEnum
CREATE TYPE "ticket_status" AS ENUM ('pending', 'in_progress', 'resolved', 'rejected', 'duplicate');

-- CreateEnum
CREATE TYPE "location_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "category_status" AS ENUM ('enable', 'disable');

-- CreateEnum
CREATE TYPE "equipment_status" AS ENUM ('active', 'awaiting_sale', 'sent_for_repair', 'broken');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'user');

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "email" VARCHAR(100),
    "full_name" VARCHAR(100),
    "google_id" VARCHAR(255),
    "avatar_url" TEXT,
    "role" "user_role" DEFAULT 'user',
    "created_at" TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "locations" (
    "location_id" SERIAL NOT NULL,
    "location_name" VARCHAR(100) NOT NULL,
    "location_status" "location_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "floors" (
    "floor_id" SERIAL NOT NULL,
    "floor_level" VARCHAR(10) NOT NULL,
    "location_id" INTEGER NOT NULL,
    "floor_status" "location_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "floors_pkey" PRIMARY KEY ("floor_id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "room_id" SERIAL NOT NULL,
    "room_name" VARCHAR(50) NOT NULL,
    "floor_id" INTEGER NOT NULL,
    "room_status" "location_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "equipment_categories" (
    "equipment_ctg_id" SERIAL NOT NULL,
    "equipment_ctg_name" VARCHAR(100) NOT NULL,
    "equipment_ctg_status" "category_status" NOT NULL DEFAULT 'enable',
    "created_at" TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "equipment_categories_pkey" PRIMARY KEY ("equipment_ctg_id")
);

-- CreateTable
CREATE TABLE "equipments" (
    "equipment_id" SERIAL NOT NULL,
    "equipment_code" VARCHAR(30),
    "equipment_name" VARCHAR(100) NOT NULL,
    "equipment_image_url" TEXT,
    "equipment_status" "equipment_status" NOT NULL DEFAULT 'active',
    "equipment_ctg_id" INTEGER NOT NULL,
    "room_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "equipments_pkey" PRIMARY KEY ("equipment_id")
);

-- CreateTable
CREATE TABLE "ticket_images" (
    "image_id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "image_type" VARCHAR(20),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_images_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "ticket_categories" (
    "ticket_ctg_id" SERIAL NOT NULL,
    "ticket_ctg_name" VARCHAR(100) NOT NULL,
    "ticket_ctg_status" "category_status" NOT NULL DEFAULT 'enable',
    "created_at" TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "ticket_categories_pkey" PRIMARY KEY ("ticket_ctg_id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "ticket_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ticket_ctg_id" INTEGER NOT NULL,
    "location_id" INTEGER NOT NULL,
    "floor_id" INTEGER,
    "room_id" INTEGER,
    "equipment_id" INTEGER,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "ticket_status" "ticket_status" DEFAULT 'pending',
    "parent_ticket_id" INTEGER,
    "admin_id" INTEGER,
    "admin_note" TEXT,
    "rating" INTEGER,
    "comment" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "timestamp_inprogress" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "timestamp_finished" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("ticket_id")
);

-- CreateTable
CREATE TABLE "upvotes" (
    "upvote_id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP,

    CONSTRAINT "upvotes_pkey" PRIMARY KEY ("upvote_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_categories_equipment_ctg_name_key" ON "equipment_categories"("equipment_ctg_name");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_categories_ticket_ctg_name_key" ON "ticket_categories"("ticket_ctg_name");

-- CreateIndex
CREATE UNIQUE INDEX "upvotes_ticket_id_user_id_key" ON "upvotes"("ticket_id", "user_id");

-- AddForeignKey
ALTER TABLE "floors" ADD CONSTRAINT "floors_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_floor_id_fkey" FOREIGN KEY ("floor_id") REFERENCES "floors"("floor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_equipment_ctg_id_fkey" FOREIGN KEY ("equipment_ctg_id") REFERENCES "equipment_categories"("equipment_ctg_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_images" ADD CONSTRAINT "ticket_images_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("ticket_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_ticket_ctg_id_fkey" FOREIGN KEY ("ticket_ctg_id") REFERENCES "ticket_categories"("ticket_ctg_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_floor_id_fkey" FOREIGN KEY ("floor_id") REFERENCES "floors"("floor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("room_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipments"("equipment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_parent_ticket_id_fkey" FOREIGN KEY ("parent_ticket_id") REFERENCES "tickets"("ticket_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upvotes" ADD CONSTRAINT "upvotes_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("ticket_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upvotes" ADD CONSTRAINT "upvotes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
