-- AlterTable
ALTER TABLE "equipments" ADD COLUMN IF NOT EXISTS "floor_id" INTEGER;
ALTER TABLE "equipments" ADD COLUMN IF NOT EXISTS "location_id" INTEGER;
ALTER TABLE "equipments" ALTER COLUMN "room_id" DROP NOT NULL;

-- Drop constraints if they exist to avoid duplication error
ALTER TABLE "equipments" DROP CONSTRAINT IF EXISTS "equipments_floor_id_fkey";
ALTER TABLE "equipments" DROP CONSTRAINT IF EXISTS "equipments_location_id_fkey";
-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_floor_id_fkey" FOREIGN KEY ("floor_id") REFERENCES "floors"("floor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE SET NULL ON UPDATE CASCADE;