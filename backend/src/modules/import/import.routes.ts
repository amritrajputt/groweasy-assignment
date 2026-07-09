import { Router } from "express";
import multer from "multer";
import { importController } from "./import.controller.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), importController.importCsv);
router.get("/status/:jobId", importController.getJobStatus);

export default router;
