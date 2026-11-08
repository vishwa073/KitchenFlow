import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth.js";

import {
  createPartyRequestController,
  getMyPartyRequestsController,
  getMyPartyRequestByIdController,
} from "./party.controller.js";

const partyRouter = Router();

// Submit a new party request
partyRouter.post("/", requireAuth, createPartyRequestController);

// Get all party requests belonging to the logged-in customer
partyRouter.get("/", requireAuth, getMyPartyRequestsController);

// Get a specific party request belonging to the logged-in customer
partyRouter.get("/:id", requireAuth, getMyPartyRequestByIdController);

export default partyRouter;