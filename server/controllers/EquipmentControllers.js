import prisma from "../config/prismaClient.js";
import ExcelJS from 'exceljs';
import csv from 'csv-parser';
import { Readable } from 'stream';

export const addEquipment = async (req, res) => {
    try {
        const {
            equipmentCode,
            equipmentName,
            equipmentImageUrl,
            equipmentStatus,
            equipmentCtgId,
            roomId,
        } = req.body;

        const equipment = await prisma.equipment.create({
            data: {
                equipmentCode,
                equipmentName,
                equipmentImageUrl,
                equipmentStatus,
                equipmentCtgId,
                roomId,
            }
        });
        res.status(201).json(equipment);

    } catch (error) {
        console.error('Error creating equipment:', error);
        res.status(500).json({ error: 'Failed to create equipment  ' });
    }
}

export const getEquipment = async (req, res) => {
    try {
        const equipments = await prisma.equipment.findMany({
            include: {
                category: true,
                room: {
                    include: {
                        floor: {
                            include: {
                                location: true
                            }
                        }
                    }
                }
            }
        })
        res.status(200).json(equipments);

    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({ error: 'Failed to fetch equipment  ' });
    }
}

export const deleteEquipment = async (req, res) => {
    try {
       const { id } = req.params;

        const equipment = await prisma.equipment.delete({
            where: {
                equipmentId: Number(id)
            }
        });
        res.status(200).json(equipment);

    } catch (error) {
        console.error('Error deleting equipment:', error);
        res.status(500).json({ error: 'Failed to delete equipment' });
    }
}

export const uploadEquipments = async (req, res) => {
    const normalize = (str) => {
        return str
            ?.toString()
            .normalize("NFC")              // กัน unicode เพี้ยน
            .replace(/[\u200B-\u200D]/g, "") // ลบ zero-width
            .replace(/\u00A0/g, " ")        // NBSP → space
            .replace(/\s+/g, " ")           // รวม space
            .trim()
            .toLowerCase();
    };
    const existingEquipments = await prisma.equipment.findMany({
        select: { equipmentCode: true }
    });

    const existingSet = new Set(
        existingEquipments.map(e => e.equipmentCode?.trim())
    );

    const seenInFile = new Set();
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filename = req.file.originalname.toLowerCase();
        let rawData = [];
        const errors = [];

        if (filename.endsWith('.xlsx')) {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(req.file.buffer);
            const worksheet = workbook.worksheets[0];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;
                const rowData = {
                    rowNumber,
                    equipmentCode: row.getCell(1).value,
                    equipmentName: row.getCell(2).value,
                    equipmentCtgId: row.getCell(3).value,
                    roomId: row.getCell(4).value,
                    locationName: row.getCell(5).value,
                };
                rawData.push(rowData);
            });
        } else if (fileName.endsWith('.csv')) {
            await new Promise((resolve, reject) => {
                let rowCount = 1;
                Readable.from(req.file.buffer)
                    .pipe(csv())
                    .on('data', (row) => {
                        rowCount++;
                        rawData.push({
                            rowNumber: rowCount,
                            equipmentCode: row['รหัสครุภัณฑ์']?.trim(),
                            equipmentName: row['ชื่อครุภัณฑ์']?.trim(),
                            equipmentCtgId: row['หมวดหมู่']?.trim(),
                            roomId: row['ห้อง']?.trim(),
                            locationName: row['สถานที่']?.trim()
                        });
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });
        } else {
            return res.status(400).json({ errors: ["ระบบรองรับเฉพาะไฟล์ .xlsx และ .csv เท่านั้น"] });
        }

        const validDataToInsert = [];
        const allCategories = await prisma.equipmentCategory.findMany();
        const allRooms = await prisma.room.findMany();

        const categoryMap = new Map(
            allCategories.map(c => [
                normalize(c.equipmentCtgName),
                c.equipmentCtgId
            ])
        );

        const roomMap = new Map(
            allRooms.map(r => [
                normalize(r.roomName),
                r.roomId
            ])
        );

        for (const item of rawData) {
            const code = item.equipmentCode?.toString().trim();

            if (!item.equipmentName || !item.equipmentCtgId || !item.roomId) {
                errors.push(`แถวที่ ${item.rowNumber}: ข้อมูลไม่ครบถ้วน`);
                continue;
            }

            if (!code) {
                errors.push(`แถวที่ ${item.rowNumber}: ไม่มีรหัสครุภัณฑ์`);
                continue;
            }

            const categoryId = categoryMap.get(normalize(item.equipmentCtgId));
            const roomId = roomMap.get(normalize(item.roomId));

            if (!categoryId) {
                errors.push(`แถวที่ ${item.rowNumber}: หมวดหมู่ "${item.equipmentCtgId}" ไม่ถูกต้อง`);
                continue;
            }

            if (!roomId) {
                errors.push(`แถวที่ ${item.rowNumber}: ห้อง "${item.roomId}" ไม่ถูกต้อง`);
                continue;
            }

            if (seenInFile.has(code)) {
                errors.push(`แถวที่ ${item.rowNumber}: รหัส "${code}" ซ้ำในไฟล์`);
                continue;
            }

            if (existingSet.has(code)) {
                errors.push(`แถวที่ ${item.rowNumber}: รหัส "${code}" มีอยู่แล้วในระบบ`);
                continue;
            }
            seenInFile.add(code);
            validDataToInsert.push({
                equipmentCode: item.equipmentCode || null,
                equipmentName: item.equipmentName,
                equipmentCtgId: categoryId,
                roomId: roomId
            });
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        if (validDataToInsert.length > 0) {
            await prisma.equipment.createMany({ 
                data: validDataToInsert,  
                skipDuplicates: true });
        }

        return res.status(200).json({ message: `อัปโหลดสำเร็จ ${validDataToInsert.length} รายการ`, errors });
    } catch (error) {
        console.error('Error uploading equipment data:', error);
        res.status(500).json({ error: 'Failed to upload equipment data' });
    }
}
