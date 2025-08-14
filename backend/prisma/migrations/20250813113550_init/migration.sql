-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "aadhaar" VARCHAR(12),
    "pan" VARCHAR(10),
    "applicantName" VARCHAR(200),
    "mobile" VARCHAR(15),
    "email" VARCHAR(200),
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Submission_aadhaar_idx" ON "Submission"("aadhaar");

-- CreateIndex
CREATE INDEX "Submission_pan_idx" ON "Submission"("pan");
