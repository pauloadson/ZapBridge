import { Router } from "express";
import sessionController from "./session.controller";

const router = Router();

router.get("/status", sessionController.status);
router.get("/qr", sessionController.getQR);
router.post("/disconnect", sessionController.disconnect);
router.post("/restart", sessionController.restart);

export default router;
