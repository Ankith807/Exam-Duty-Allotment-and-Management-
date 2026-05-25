-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: localhost    Database: eds
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `exam_availability`
--

DROP TABLE IF EXISTS `exam_availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_availability` (
  `availability_id` int NOT NULL AUTO_INCREMENT,
  `exam_id` varchar(50) NOT NULL,
  `exam_date` date NOT NULL,
  `user_id` varchar(100) NOT NULL,
  `availability_status` enum('Available','Not Available') NOT NULL DEFAULT 'Not Available',
  `reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `session` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`availability_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_availability`
--

LOCK TABLES `exam_availability` WRITE;
/*!40000 ALTER TABLE `exam_availability` DISABLE KEYS */;
/*!40000 ALTER TABLE `exam_availability` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_dates`
--

DROP TABLE IF EXISTS `exam_dates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_dates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int NOT NULL,
  `exam_date` date NOT NULL,
  `exam_duty_count` int NOT NULL,
  `reliever_duty_count` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `session` enum('morning','afternoon') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exam_id` (`exam_id`),
  CONSTRAINT `exam_dates_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_dates`
--

LOCK TABLES `exam_dates` WRITE;
/*!40000 ALTER TABLE `exam_dates` DISABLE KEYS */;
INSERT INTO `exam_dates` VALUES (55,40,'2025-08-22',9,9,'2025-08-10 10:41:20','morning'),(56,41,'2025-08-30',10,10,'2025-08-10 12:49:50','morning'),(57,42,'2025-08-21',19,17,'2025-08-10 12:54:35','morning'),(58,44,'2025-08-21',5,2,'2025-08-10 13:10:36','morning'),(60,46,'2025-08-26',4,2,'2025-08-10 13:33:04','morning'),(61,47,'2025-09-12',10,10,'2025-08-10 13:36:16','afternoon');
/*!40000 ALTER TABLE `exam_dates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_selections`
--

DROP TABLE IF EXISTS `exam_selections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_selections` (
  `selection_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(100) NOT NULL,
  `exam_id` varchar(50) NOT NULL,
  `exam_date` date NOT NULL,
  `duty_type` enum('Exam Duty','Reliever Duty') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `session` enum('morning','afternoon') DEFAULT NULL,
  PRIMARY KEY (`selection_id`)
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_selections`
--

LOCK TABLES `exam_selections` WRITE;
/*!40000 ALTER TABLE `exam_selections` DISABLE KEYS */;
/*!40000 ALTER TABLE `exam_selections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exams`
--

DROP TABLE IF EXISTS `exams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` varchar(50) NOT NULL,
  `exam_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `dueDate` date DEFAULT NULL,
  `status` varchar(20) DEFAULT 'ongoing',
  PRIMARY KEY (`id`),
  UNIQUE KEY `exam_id` (`exam_id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exams`
--

LOCK TABLES `exams` WRITE;
/*!40000 ALTER TABLE `exams` DISABLE KEYS */;
INSERT INTO `exams` VALUES (40,'mul4','mul4','2025-08-10 10:41:20','2025-08-18','ongoing'),(41,'MID-2025','Sem-3','2025-08-10 12:49:50','2025-08-23','ongoing'),(42,'Etest','ET$','2025-08-10 12:54:35','2025-08-16','ongoing'),(44,'EMAIL-TEST-002','Email Test Exam 2','2025-08-10 13:10:36','2025-08-15','ongoing'),(46,'EMAIL-FINAL-TEST','Final Email Test','2025-08-10 13:33:04','2025-08-15','ongoing'),(47,'etesr','erxfg','2025-08-10 13:36:16','2025-09-06','ongoing');
/*!40000 ALTER TABLE `exams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','faculty','examdutyofficer','principal') DEFAULT 'faculty',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `phone` varchar(15) DEFAULT NULL,
  `profile_picture` varchar(500) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `is_email_verified` tinyint(1) DEFAULT '0',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_reset_token` (`reset_token`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (14,'admin','admin@gmail.com','$2b$10$oEhcGC3ph.mvUb1xZeuc0uhNtDBjvdExlW.Am8c8aAyEAUkS/wwdS','admin','2025-05-31 03:47:41','9800324244','https://res.cloudinary.com/dyc8k9bqk/image/upload/v1754766476/profile_pictures/ku8zi5qhl1rqegvqigso.jpg','MCA',0,NULL,NULL),(15,'faculty','faculty@gmail.com','$2b$10$/tLTsRYcdQV39pKHktNiNuXDi2E6mHtSqAwgMhghOG/VPj9Me..V2','faculty','2025-05-31 03:48:39','6578909878','https://res.cloudinary.com/dyc8k9bqk/image/upload/v1754812709/profile_pictures/jv7jmpehnthrwdbfn7vy.jpg','MCA',0,NULL,NULL),(16,'Arjun','arjun@gmail.com','$2b$10$mOTAvzciWkQFmhV/e71sueAgy.InWLCfMYE9M6A4cAIwSzAsSAoGu','faculty','2025-06-23 02:36:35','9800324244',NULL,'MCA',0,NULL,NULL),(17,'Praneeth','praneeth@gmail.com','$2b$10$lhDdgdU6xd1e8.zlBLKvLOq1t3fyOlPvQqD0DrqxnATSxvT2/8S4q','faculty','2025-06-23 02:37:17','6578909878',NULL,'mca',0,'cf356b0a0b3d5238af6099aa3e370be0aca84b223fb99942778555ca4370c657','2025-07-27 17:16:47'),(20,'Praneeth Kumar Gowda','praneethkumar189201@gmail.com','$2b$10$ys//fVam3jelE8A6IIa66umkZ07AlWG0IEA0e4WGUTvs6j1jdn07y','faculty','2025-07-10 15:57:16','9800324244',NULL,'MCA',0,NULL,NULL),(21,'Sharath','sharath@gmail.com','$2b$10$sDAvQN5kGpH3tt1ZGrmpCeQ9oPbEi5CAoe2QF13unZmtyFC0k4FTu','faculty','2025-08-10 07:25:50','6578909878',NULL,'MCA',0,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-17 22:20:07
