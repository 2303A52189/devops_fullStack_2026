const router = require("express").Router();
const asyncHandler = require("../middleware/asyncHandler");
const e = require("../controllers/enrollment.controller");

router.post("/", asyncHandler(e.createEnrollment));
router.get("/", asyncHandler(e.getAllEnrollments));
router.get("/:id", asyncHandler(e.getEnrollmentById));
router.delete("/:id", asyncHandler(e.deleteEnrollment));

module.exports = router;
