import { Router } from "express";
import { sendMessage } from "./message.controller";

const router = Router();

router.post("/send", sendMessage);

export default router;
