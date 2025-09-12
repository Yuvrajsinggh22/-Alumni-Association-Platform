/*
  Warnings:

  - You are about to drop the column `department` on the `alumni` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_alumni" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "profilePicture" TEXT,
    "phone" TEXT,
    "graduationYear" INTEGER NOT NULL,
    "degree" TEXT NOT NULL,
    "currentJob" TEXT,
    "currentCompany" TEXT,
    "location" TEXT,
    "bio" TEXT,
    "skills" TEXT,
    "interests" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "websiteUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_alumni" ("bio", "createdAt", "currentCompany", "currentJob", "degree", "email", "emailVerified", "githubUrl", "graduationYear", "id", "interests", "isPublic", "isVerified", "lastLogin", "linkedinUrl", "location", "name", "password", "phone", "profilePicture", "skills", "updatedAt", "websiteUrl") SELECT "bio", "createdAt", "currentCompany", "currentJob", "degree", "email", "emailVerified", "githubUrl", "graduationYear", "id", "interests", "isPublic", "isVerified", "lastLogin", "linkedinUrl", "location", "name", "password", "phone", "profilePicture", "skills", "updatedAt", "websiteUrl" FROM "alumni";
DROP TABLE "alumni";
ALTER TABLE "new_alumni" RENAME TO "alumni";
CREATE UNIQUE INDEX "alumni_email_key" ON "alumni"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
