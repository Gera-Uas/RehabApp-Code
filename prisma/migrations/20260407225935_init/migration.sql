-- CreateTable
CREATE TABLE `ExerciseGroup` (
    `id` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `category` ENUM('movilidad', 'estiramientos', 'fortalecimiento') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ExerciseGroup_groupId_idx`(`groupId`),
    UNIQUE INDEX `ExerciseGroup_groupId_category_key`(`groupId`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Exercise` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `videoUrl` TEXT NOT NULL,
    `level` ENUM('principiante', 'intermedio', 'avanzado') NOT NULL,
    `movementType` ENUM('controlado', 'dinamico', 'pendular', 'estatico', 'isometrico') NOT NULL,
    `position` ENUM('sentado', 'de_pie', 'cuatro_puntos', 'acostado_supino', 'acostado_prono', 'inclinado') NOT NULL,
    `equipment` ENUM('sin_equipo', 'pared', 'banda_elastica', 'pesas_ligeras') NOT NULL,
    `metrics` JSON NOT NULL,
    `targetMuscles` JSON NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Exercise_groupId_idx`(`groupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExerciseTag` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ExerciseTag_name_key`(`name`),
    INDEX `ExerciseTag_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExerciseTagRelation` (
    `exerciseId` VARCHAR(191) NOT NULL,
    `tagId` VARCHAR(191) NOT NULL,

    INDEX `ExerciseTagRelation_tagId_idx`(`tagId`),
    PRIMARY KEY (`exerciseId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Exercise` ADD CONSTRAINT `Exercise_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `ExerciseGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExerciseTagRelation` ADD CONSTRAINT `ExerciseTagRelation_exerciseId_fkey` FOREIGN KEY (`exerciseId`) REFERENCES `Exercise`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExerciseTagRelation` ADD CONSTRAINT `ExerciseTagRelation_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `ExerciseTag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
