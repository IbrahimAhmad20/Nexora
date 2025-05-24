CREATE DATABASE  IF NOT EXISTS `be7e7mwwpdj6uexbp7vs` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `be7e7mwwpdj6uexbp7vs`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: railway
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `label` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `zip` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_settings`
--

DROP TABLE IF EXISTS `admin_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(255) NOT NULL,
  `setting_value` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_settings`
--

LOCK TABLES `admin_settings` WRITE;
/*!40000 ALTER TABLE `admin_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int DEFAULT NULL,
  `old_value` json DEFAULT NULL,
  `new_value` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=218 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 18:25:17'),(2,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 18:25:23'),(3,14,'GET /api/admin/users','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 18:25:27'),(4,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 18:25:30'),(5,14,'GET /api/admin/users','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 18:25:31'),(6,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 18:25:32'),(7,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 18:26:15'),(8,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 18:29:21'),(9,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 18:30:48'),(10,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 18:32:09'),(11,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 18:41:36'),(12,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 18:42:24'),(13,14,'GET /api/admin/vendors','',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 18:42:25'),(14,14,'DELETE /api/admin/vendors/3','',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 18:50:43'),(15,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 18:59:42'),(16,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 19:00:44'),(17,14,'DELETE /api/admin/vendors/4','',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 19:01:19'),(18,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 19:31:09'),(19,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 19:41:26'),(20,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 19:42:28'),(21,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 19:49:14'),(22,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 19:53:24'),(23,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 19:55:05'),(24,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:12:20'),(25,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:12:43'),(26,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:15:04'),(27,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:16:35'),(28,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:16:57'),(29,14,'GET /api/admin/users','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:16:59'),(30,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:17:04'),(31,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:17:09'),(32,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:17:10'),(33,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:20:47'),(34,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:24:00'),(35,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:24:05'),(36,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:25:07'),(37,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:26:40'),(38,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:28:12'),(39,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:29:05'),(40,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:32:45'),(41,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:33:59'),(42,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:37:55'),(43,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:38:13'),(44,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:38:27'),(45,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:41:27'),(46,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:43:00'),(47,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:43:04'),(48,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:43:06'),(49,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:43:07'),(50,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:44:42'),(51,14,'GET /api/admin/products','',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:45:52'),(52,14,'GET /api/admin/products','',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:45:59'),(53,14,'GET /api/admin/products','',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:47:00'),(54,14,'GET /api/admin/products','',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:47:24'),(55,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:50:19'),(56,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:53:25'),(57,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:54:31'),(58,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:54:32'),(59,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:55:14'),(60,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:55:48'),(61,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:55:50'),(62,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:55:51'),(63,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:56:13'),(64,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 20:56:16'),(65,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:00:35'),(66,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:00:40'),(67,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:00:43'),(68,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:02:47'),(69,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:02:51'),(70,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:04:45'),(71,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:04:48'),(72,14,'PUT /api/admin/products/13','admin',13,'{\"name\": \"New Smartphone\", \"price\": 699.99, \"status\": \"inactive\", \"category_id\": 4, \"description\": \"Latest model\", \"stock_quantity\": 50}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:04:50'),(73,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:04:54'),(74,14,'PUT /api/admin/products/13','admin',13,'{\"name\": \"New Smartphone\", \"price\": 699.99, \"status\": \"inactive\", \"category_id\": 4, \"description\": \"Latest model\", \"stock_quantity\": 50}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:04:56'),(75,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:04:59'),(76,14,'PUT /api/admin/products/13','admin',13,'{\"name\": \"New Smartphone\", \"price\": 699.99, \"status\": \"active\", \"category_id\": 4, \"description\": \"Latest model\", \"stock_quantity\": 51}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:05:02'),(77,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:05:11'),(78,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:05:18'),(79,14,'PUT /api/admin/products/7','admin',7,'{\"name\": \"Samsung S25sss\", \"price\": 22, \"status\": \"active\", \"category_id\": 4, \"description\": \"rewfgsgerf\", \"stock_quantity\": 3}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:05:20'),(80,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:06:44'),(81,14,'PUT /api/admin/products/11','admin',11,'{\"name\": \"Edited\", \"price\": 1212, \"status\": \"active\", \"category_id\": 4, \"description\": \"dfsdf\", \"stock_quantity\": 12}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:06:51'),(82,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:06:54'),(83,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:07:02'),(84,14,'PUT /api/admin/products/13','admin',13,'{\"name\": \"New Smartphone\", \"price\": 699.99, \"status\": \"inactive\", \"category_id\": 4, \"description\": \"Latest model\", \"stock_quantity\": 51}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:07:04'),(85,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:07:05'),(86,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:07:06'),(87,14,'PUT /api/admin/products/13','admin',13,'{\"name\": \"New Smartphone\", \"price\": 699.99, \"status\": \"active\", \"category_id\": 4, \"description\": \"Latest model\", \"stock_quantity\": 51}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:07:08'),(88,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:07:09'),(89,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:07:13'),(90,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:07:17'),(91,14,'PUT /api/admin/products/12','admin',12,'{\"name\": \"Bahria\", \"price\": 1, \"status\": \"active\", \"category_id\": 6, \"description\": \"dasfsdafadsf\", \"stock_quantity\": 3}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:07:20'),(92,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:07:21'),(93,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:23:57'),(94,14,'DELETE /api/admin/products/11','',NULL,NULL,'{\"message\": \"Not found\", \"success\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:24:03'),(95,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:24:08'),(96,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:24:10'),(97,14,'DELETE /api/admin/products/11','',NULL,NULL,'{\"message\": \"Not found\", \"success\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:24:20'),(98,14,'DELETE /api/admin/products/11','admin',11,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:27:14'),(99,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:29:36'),(100,14,'DELETE /api/admin/products/11','admin',11,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:29:38'),(101,14,'DELETE /api/admin/products/11','admin',11,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:31:21'),(102,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:31:22'),(103,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:31:28'),(104,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:33:31'),(105,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:33:41'),(106,14,'GET /api/admin/users','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:33:44'),(107,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:33:47'),(108,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:33:48'),(109,14,'DELETE /api/admin/products/9','admin',9,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:33:52'),(110,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:33:53'),(111,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:33:55'),(112,14,'GET /api/admin/users','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:33:59'),(113,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:34:04'),(114,14,'GET /api/admin/users','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:34:06'),(115,14,'GET /api/admin/users','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:45:35'),(116,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:45:39'),(117,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:51:17'),(118,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:51:20'),(119,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:52:06'),(120,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:52:31'),(121,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:53:06'),(122,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:53:12'),(123,14,'GET /api/admin/users','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:53:16'),(124,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:53:17'),(125,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:54:45'),(126,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:54:50'),(127,14,'GET /api/admin/orders','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 21:59:23'),(128,14,'GET /api/admin/orders','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:01:34'),(129,14,'GET /api/admin/orders','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:01:54'),(130,14,'GET /api/admin/orders','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:02:39'),(131,14,'PUT /api/admin/orders/16/status','admin',16,'{\"status\": \"processing\"}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:02:47'),(132,14,'GET /api/admin/orders','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:02:49'),(133,14,'GET /api/admin/orders/16','admin',16,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:03:08'),(134,14,'GET /api/admin/orders/16','admin',16,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:03:13'),(135,14,'GET /api/admin/orders','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:06:25'),(136,14,'GET /api/admin/orders/16','admin',16,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:06:26'),(137,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:06:34'),(138,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:06:39'),(139,14,'GET /api/admin/users','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:06:40'),(140,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:06:41'),(141,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:07:40'),(142,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:07:41'),(143,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:07:42'),(144,14,'GET /api/admin/orders','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:07:43'),(145,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:08:46'),(146,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:09:21'),(147,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:12:16'),(148,14,'GET /api/admin/users','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:12:20'),(149,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:12:27'),(150,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:12:28'),(151,14,'POST /api/admin/categories','',NULL,'{\"name\": \"Test\"}','{\"message\": \"Not found\", \"success\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:12:39'),(152,14,'DELETE /api/admin/categories/3','',NULL,NULL,'{\"message\": \"Not found\", \"success\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:13:15'),(153,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:14:34'),(154,14,'DELETE /api/admin/categories/3','',NULL,NULL,'{\"message\": \"Not found\", \"success\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:14:36'),(155,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:15:47'),(156,14,'DELETE /api/admin/categories/3','admin',3,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:15:50'),(157,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:15:50'),(158,14,'DELETE /api/admin/categories/2','admin',2,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:15:55'),(159,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:15:55'),(160,14,'POST /api/admin/categories','admin',NULL,'{\"name\": \"Test\"}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:16:01'),(161,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:16:01'),(162,14,'PUT /api/admin/categories/10','admin',10,'{\"name\": \"Testtt\"}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:16:06'),(163,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:16:06'),(164,14,'DELETE /api/admin/categories/10','admin',10,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:16:08'),(165,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:16:08'),(166,14,'GET /api/admin/users','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:16:52'),(167,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:16:54'),(168,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:18:22'),(169,14,'GET /api/admin/orders','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:19:00'),(170,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:19:01'),(171,14,'GET /api/admin/users','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:19:08'),(172,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:19:09'),(173,14,'GET /api/admin/users','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:19:10'),(174,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:19:11'),(175,14,'GET /api/admin/orders','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:19:11'),(176,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:19:21'),(177,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:19:22'),(178,14,'GET /api/admin/orders','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:19:23'),(179,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:19:24'),(180,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:19:24'),(181,14,'GET /api/admin/orders','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:19:25'),(182,14,'GET /api/admin/orders','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:19:26'),(183,14,'GET /api/admin/orders','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:19:48'),(184,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:19:49'),(185,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:19:54'),(186,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:21:15'),(187,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:21:26'),(188,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:22:07'),(189,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:22:55'),(190,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:24:13'),(191,14,'PUT /api/admin/products/13/featured','admin',13,'{\"featured\": 1}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:24:19'),(192,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:24:19'),(193,14,'PUT /api/admin/products/13/featured','admin',13,'{\"featured\": 1}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:24:21'),(194,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:24:21'),(195,14,'PUT /api/admin/products/13/featured','admin',13,'{\"featured\": 1}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:24:21'),(196,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:24:21'),(197,14,'PUT /api/admin/products/13/featured','admin',13,'{\"featured\": 1}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:24:23'),(198,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:24:23'),(199,14,'PUT /api/admin/products/13/featured','admin',13,'{\"featured\": 1}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:24:32'),(200,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:24:32'),(201,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:27:53'),(202,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:28:48'),(203,14,'PUT /api/admin/products/5/featured','admin',5,'{\"featured\": 1}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:28:55'),(204,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:28:55'),(205,14,'PUT /api/admin/products/4/featured','admin',4,'{\"featured\": 1}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:28:56'),(206,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:28:56'),(207,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:29:10'),(208,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 22:59:41'),(209,14,'GET /api/admin/orders','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 23:07:37'),(210,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','2025-05-17 23:07:40'),(211,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36','2025-05-18 09:54:37'),(212,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36','2025-05-18 09:54:43'),(213,14,'GET /api/admin/dashboard/analytics','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36','2025-05-18 09:54:51'),(214,14,'GET /api/admin/users','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36','2025-05-18 09:54:53'),(215,14,'GET /api/admin/products','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36','2025-05-18 09:54:56'),(216,14,'GET /api/admin/orders','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36','2025-05-18 09:54:59'),(217,14,'GET /api/admin/categories','admin',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36','2025-05-18 09:55:00');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (4,'Electronics','Electronic devices and gadgets','2025-05-17 20:09:14'),(5,'Fashion','Clothing and accessories','2025-05-17 20:09:14'),(6,'Home & Living','Home appliances and furniture','2025-05-17 20:09:14'),(7,'Beauty','Beauty and personal care','2025-05-17 20:09:14'),(8,'Sports','Sports equipment and accessories','2025-05-17 20:09:14'),(9,'Books','Books and literature','2025-05-17 20:09:14');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price_at_time` decimal(10,2) NOT NULL,
  `vendor_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `vendor_id` (`vendor_id`),
  KEY `idx_order_items_order` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`vendor_id`) REFERENCES `vendor_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (9,9,4,1,1222.00,2,'2025-05-10 22:50:04'),(15,16,12,3,1.00,6,'2025-05-17 16:49:08'),(16,17,4,1,1222.00,2,'2025-05-18 08:22:48'),(17,17,12,1,1.00,6,'2025-05-18 08:22:48'),(18,18,5,1,1223.00,2,'2025-05-18 08:35:34'),(19,20,12,1,1.00,6,'2025-05-18 09:36:16');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `shipping_address` text NOT NULL,
  `payment_method` varchar(32) DEFAULT 'card',
  `payment_status` enum('pending','paid','failed') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_orders_customer` (`customer_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,8,19.99,'pending','123 Test St','card','paid','2025-05-10 15:09:01','2025-05-10 15:09:01'),(2,8,122.00,'processing','123 Test St','card','paid','2025-05-10 15:18:39','2025-05-10 18:18:55'),(9,11,1222.00,'pending','123 Main Street, Apt 4B\nNew York, NY 10001\nUnited States','card','pending','2025-05-10 22:50:04','2025-05-10 22:50:04'),(10,11,3636.00,'pending','123 Main Street, Apt 4B\nNew York, NY 10001\nUnited States','card','pending','2025-05-10 22:51:25','2025-05-10 22:51:25'),(11,11,1212.00,'pending','123 Main Street, Apt 4B\nNew York, NY 10001\nUnited States','card','pending','2025-05-10 23:18:16','2025-05-10 23:18:16'),(12,11,4848.00,'pending','456 Business Ave, Floor 12\nNew York, NY 10005\nUnited States','card','pending','2025-05-12 05:32:51','2025-05-12 05:32:51'),(13,11,1212.00,'pending','123 Main Street, Apt 4B\nNew York, NY 10001\nUnited States','card','pending','2025-05-12 08:39:53','2025-05-12 08:39:53'),(14,11,1212.00,'pending','123 Main Street, Apt 4B\nNew York, NY 10001\nUnited States','card','pending','2025-05-16 05:18:52','2025-05-16 05:18:52'),(16,15,3.00,'processing','123 Main Street, Apt 4B\nNew York, NY 10001\nUnited States','card','pending','2025-05-17 16:49:08','2025-05-17 22:02:47'),(17,11,1223.00,'pending','123 Main Street, Apt 4B\nNew York, NY 10001\nUnited States','card','pending','2025-05-18 08:22:48','2025-05-18 08:22:48'),(18,11,1223.00,'pending','123 Main Street, Apt 4B\nNew York, NY 10001\nUnited States','card','pending','2025-05-18 08:35:34','2025-05-18 08:35:34'),(20,11,1.00,'pending','123 Main Street, Apt 4B\nNew York, NY 10001\nUnited States','card','pending','2025-05-18 09:36:16','2025-05-18 09:36:16');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,1,'/uploads/products/images-1746813717860-591897421.jpeg',1,'2025-05-09 18:01:57'),(2,2,'/uploads/products/images-1746818497837-141155245.jpg',1,'2025-05-09 19:21:37'),(3,3,'/uploads/products/images-1746818765106-241476833.jpg',1,'2025-05-09 19:26:05'),(4,4,'/uploads/products/images-1746821826168-551036308.jpg',1,'2025-05-09 20:17:06'),(5,5,'/uploads/products/images-1746822204683-930653974.jpeg',0,'2025-05-09 20:23:24'),(6,5,'uploads\\products\\images-1746881556318-509032385.jpeg',0,'2025-05-10 12:52:36'),(7,5,'uploads\\products\\images-1746881576333-709491062.jpg',0,'2025-05-10 12:52:56'),(8,5,'uploads\\products\\images-1746881600122-475019372.jpg',0,'2025-05-10 12:53:20'),(9,5,'uploads\\products\\images-1746881884420-585503262.jpg',0,'2025-05-10 12:58:04'),(10,5,'uploads\\products\\images-1746881941793-117162459.jpg',0,'2025-05-10 12:59:01'),(11,5,'uploads\\products\\images-1746882340920-958842378.jpg',0,'2025-05-10 13:05:40'),(12,5,'uploads\\products\\images-1746882596642-742808395.jpg',0,'2025-05-10 13:09:56'),(13,5,'uploads\\products\\images-1746882678070-295484663.jpg',0,'2025-05-10 13:11:18'),(14,5,'uploads\\products\\images-1746883018298-447882358.jpg',0,'2025-05-10 13:16:58'),(15,4,'uploads\\products\\images-1746883045499-114383238.jpeg',1,'2025-05-10 13:17:25'),(16,5,'uploads\\products\\images-1746883608133-908055276.png',0,'2025-05-10 13:26:48'),(17,5,'uploads\\products\\images-1746884035342-258013504.jpg',0,'2025-05-10 13:33:55'),(18,5,'/uploads/products/images-1746884867061-695634871.jpg',0,'2025-05-10 13:47:47'),(19,5,'/uploads/products/images-1746884878949-673002191.jpeg',0,'2025-05-10 13:47:58'),(20,5,'/uploads/products/images-1746884995815-122414113.png',1,'2025-05-10 13:49:55'),(21,6,'/uploads/products/images-1746885021032-364213458.png',1,'2025-05-10 13:50:21'),(22,7,'/uploads/products/images-1746885927125-973161061.png',1,'2025-05-10 14:05:27'),(23,7,'/uploads/products/images-1746885927129-81964423.jpeg',0,'2025-05-10 14:05:27'),(24,7,'/uploads/products/images-1746885927130-699065372.jpg',0,'2025-05-10 14:05:27'),(26,10,'/uploads/products/images-1746914534373-658368883.jpg',0,'2025-05-10 22:02:14'),(27,10,'/uploads/products/images-1746917446844-128236144.jpg',1,'2025-05-10 22:50:46'),(29,12,'/uploads/products/images-1746918821644-713040678.jpg',0,'2025-05-10 23:13:41'),(30,12,'/uploads/products/images-1747500396654-872057125.jpg',0,'2025-05-17 16:46:36'),(31,12,'/uploads/products/images-1747500403576-719052947.jpg',0,'2025-05-17 16:46:43'),(32,12,'/uploads/products/images-1747500535491-21716538.jpg',1,'2025-05-17 16:48:55');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_qa`
--

DROP TABLE IF EXISTS `product_qa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_qa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `question` text NOT NULL,
  `answer` text,
  `answered_by` int DEFAULT NULL,
  `answered_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `user_id` (`user_id`),
  KEY `answered_by` (`answered_by`),
  CONSTRAINT `product_qa_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `product_qa_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `product_qa_ibfk_3` FOREIGN KEY (`answered_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_qa`
--

LOCK TABLES `product_qa` WRITE;
/*!40000 ALTER TABLE `product_qa` DISABLE KEYS */;
INSERT INTO `product_qa` VALUES (2,5,11,'Test Questioon',NULL,NULL,NULL,'2025-05-18 13:36:22'),(3,5,11,'Hey buddy How u Doin?\n',NULL,NULL,NULL,'2025-05-18 13:36:36'),(4,5,11,'Test\n',NULL,NULL,NULL,'2025-05-18 13:39:38'),(5,12,11,'Hi Buddy',NULL,NULL,NULL,'2025-05-18 13:41:03');
/*!40000 ALTER TABLE `product_qa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_specifications`
--

DROP TABLE IF EXISTS `product_specifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_specifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `category` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `value` text NOT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_specifications_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_specifications`
--

LOCK TABLES `product_specifications` WRITE;
/*!40000 ALTER TABLE `product_specifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_specifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive','deleted') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_featured` tinyint(1) DEFAULT '0',
  `featured` tinyint(1) DEFAULT '0',
  `category_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_products_vendor` (`vendor_id`),
  KEY `fk_products_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendor_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,2,'Samsung S25','sdfgfgds',22.00,2,'deleted','2025-05-09 18:01:57','2025-05-17 20:14:41',0,0,4),(2,2,'Samsung S24','ghdfdfgh',1200.00,4,'deleted','2025-05-09 19:21:37','2025-05-17 20:14:41',0,0,4),(3,2,'Samsung S25','ryryu',33.00,3,'deleted','2025-05-09 19:26:05','2025-05-17 20:14:41',0,0,4),(4,2,'Samsung S25','fdgsgfdsg',1222.00,0,'active','2025-05-09 20:17:06','2025-05-18 08:22:48',0,1,4),(5,2,'Apple MacBook','gfdshgfdhdsa',1223.00,2,'active','2025-05-09 20:23:24','2025-05-18 08:35:34',0,1,4),(6,2,'sss','sdfgfds',2.00,2,'active','2025-05-10 13:50:21','2025-05-17 20:14:41',0,0,4),(7,2,'Samsung S25sss','rewfgsgerf',22.00,3,'active','2025-05-10 14:05:27','2025-05-17 21:05:20',0,0,4),(10,6,'new','fdasdsf',122.00,2,'deleted','2025-05-10 22:02:14','2025-05-17 20:14:41',0,0,4),(12,6,'Bahria','dasfsdafadsf',1.00,1,'active','2025-05-10 23:13:41','2025-05-18 09:36:16',0,0,6),(13,1,'New Smartphone','Latest model',699.99,51,'active','2025-05-17 20:12:03','2025-05-17 22:24:19',0,1,4);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `related_products`
--

DROP TABLE IF EXISTS `related_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `related_products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `related_product_id` int NOT NULL,
  `relation_type` varchar(50) DEFAULT NULL,
  `priority` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `product_id` (`product_id`,`related_product_id`),
  KEY `idx_related_products_product_id` (`product_id`),
  KEY `idx_related_products_related_id` (`related_product_id`),
  CONSTRAINT `related_products_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `related_products_ibfk_2` FOREIGN KEY (`related_product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `related_products`
--

LOCK TABLES `related_products` WRITE;
/*!40000 ALTER TABLE `related_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `related_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `idx_reviews_product` (`product_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shopping_cart`
--

DROP TABLE IF EXISTS `shopping_cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shopping_cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `idx_shopping_cart_customer` (`customer_id`),
  CONSTRAINT `shopping_cart_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shopping_cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shopping_cart`
--

LOCK TABLES `shopping_cart` WRITE;
/*!40000 ALTER TABLE `shopping_cart` DISABLE KEYS */;
INSERT INTO `shopping_cart` VALUES (16,13,12,1,'2025-05-17 12:56:07','2025-05-17 12:56:07'),(24,11,12,2,'2025-05-18 10:03:22','2025-05-18 10:03:25');
/*!40000 ALTER TABLE `shopping_cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('admin','vendor','customer') NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `two_factor_enabled` tinyint(1) DEFAULT '0',
  `totp_secret` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'ibrahimmohseen@gmail.com','$2b$10$GTyYMdm50faUq/CFCAq4Pe9KOVUfmNDJT/OgG70dTHyRm2nYHGjSm','vendor','Muhammad','Ibrahim',NULL,'2025-05-09 15:23:05','2025-05-09 15:23:05',0,NULL),(2,'mohsneen@gmail.com','$2b$10$JTbQonY0u0vp4aKjXWcOaOE3ezwGzQwjI8I3gQkn.tf/y81aYpYJK','vendor','Muhammad','Ibrahim',NULL,'2025-05-09 15:25:01','2025-05-09 15:25:01',0,NULL),(3,'mohsneeen@gmail.com','$2b$10$ufakPWy2R2BDnIiawMyCnueiFDzZkp4jyzrtZa7I2tjt8nCs88Of2','vendor','Muhammad','Ibrahim',NULL,'2025-05-09 15:39:42','2025-05-09 15:39:42',0,NULL),(4,'ibrahimmohseeen@gmail.com','$2b$10$5O.UvUUrNeg52hOjFnibM.akpKGBBLdxhBnrZc2m2NlUGEjudO5Sa','vendor','Muhammad','Ibrahim',NULL,'2025-05-09 15:42:02','2025-05-09 15:42:02',0,NULL),(5,'ibrahimmohseenn@gmail.com','$2b$10$0u.hqsL3mhI7C8XTa2KLSOGowFT5y3JpW6Zs1wm2jk2SOM7P5qmIa','customer','Muhammad','Ibrahim',NULL,'2025-05-10 14:57:51','2025-05-10 14:57:51',0,NULL),(6,'ibrahimmohseennn@gmail.com','$2b$10$JpdpTbiggDqJxr.G7qzIMuqcq965GQGcBfoQPSaIEXf6u11BgHk2C','customer','Muhammad','Ibrahim',NULL,'2025-05-10 14:58:32','2025-05-10 14:58:32',0,NULL),(7,'abc@gmail.com','$2b$10$FlCKa/7Ypzoc54OWtQUm/eLyktBZIBVBHOsra2BG6Lc3EVB2hcNkm','customer','Muhammad','Ibrahim',NULL,'2025-05-10 14:59:11','2025-05-10 14:59:11',0,NULL),(8,'testcustomer@example.com','testpass','customer','Test','Customer',NULL,'2025-05-10 15:09:01','2025-05-10 15:09:01',0,NULL),(9,'testvendor@example.com','testpass','vendor','Test','Vendor',NULL,'2025-05-10 15:09:01','2025-05-10 15:09:01',0,NULL),(10,'testvendor1@example.com','$2b$10$eG19YKrEOEKn70uhQztrT.o0INieIUUNaALETbD4TdtwXt2GWQdiK','vendor','Muhammad','Ibrahim','03335849888','2025-05-10 15:15:40','2025-05-10 16:37:22',1,'OIUD4TBZN5UVKVDVI5EHS63INZHUAYR4FYXCGOKVJI7FCTJEJF2A'),(11,'testuser@gmail.com','$2b$10$nKefY2aqoEyiMbTKfexMUeobJxEV.eG2jOFOvlZmVGIFc5HiER13u','customer','Test','User',NULL,'2025-05-10 17:41:38','2025-05-10 17:41:38',0,NULL),(12,'testuser1@gmail.com','$2b$10$CCTgigkA3GVadFFv7Ecin.jGZolesukGPkHYOmbXAnO0oQSpX/AJW','customer','Test','User',NULL,'2025-05-17 12:34:33','2025-05-17 12:34:33',0,NULL),(13,'mogaming810@gmail.com','OAUTH','customer','MO_','GAMING',NULL,'2025-05-17 12:55:58','2025-05-17 12:55:58',0,NULL),(14,'admin@gmail.com','$2b$10$u4C1uxaI5HF5qyKrPtQys.q.Q2gCtpyHjBwufvIQUZE3EHQeXDU3S','admin','admin','admin',NULL,'2025-05-17 14:38:37','2025-05-17 14:45:04',0,NULL),(15,'logintest1@gmail.com','$2b$10$Du0tYG0dy2oR3huxDewPkOyHTFTnmO4dBpXXt4BueTEvRENvzs/am','customer','Muhammad','Ibrahim',NULL,'2025-05-17 16:45:59','2025-05-17 16:45:59',0,NULL),(16,'saim@gmail.com','$2b$10$XBMzsf0a6n6BIs0MwUIwBOiic9SBCjLGANyUnCAmlKEHIhH.av/H.','vendor','Saim','Zafar',NULL,'2025-05-17 19:19:33','2025-05-17 19:19:33',0,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variant_options`
--

DROP TABLE IF EXISTS `variant_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variant_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `variant_id` int NOT NULL,
  `option_name` varchar(50) NOT NULL,
  `option_value` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `variant_options_ibfk_1` (`variant_id`),
  CONSTRAINT `variant_options_ibfk_1` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variant_options`
--

LOCK TABLES `variant_options` WRITE;
/*!40000 ALTER TABLE `variant_options` DISABLE KEYS */;
/*!40000 ALTER TABLE `variant_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor_profiles`
--

DROP TABLE IF EXISTS `vendor_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `business_description` text,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `address` text,
  `tax_id` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `logo_url` varchar(255) DEFAULT NULL,
  `store_status` varchar(20) DEFAULT 'open',
  `vacation_message` text,
  `notify_on_return` tinyint(1) DEFAULT '0',
  `shipping_policy` text,
  `return_policy` text,
  `privacy_policy` text,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `vendor_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_profiles`
--

LOCK TABLES `vendor_profiles` WRITE;
/*!40000 ALTER TABLE `vendor_profiles` DISABLE KEYS */;
INSERT INTO `vendor_profiles` VALUES (1,1,'Muhammad\'s Business',NULL,'pending',NULL,NULL,'2025-05-09 15:23:05','2025-05-09 15:23:05',NULL,'open',NULL,0,NULL,NULL,NULL),(2,2,'Muhammad\'s Business',NULL,'pending',NULL,NULL,'2025-05-09 15:25:01','2025-05-09 15:25:01',NULL,'open',NULL,0,NULL,NULL,NULL),(4,4,'Muhammad\'s Business',NULL,'pending',NULL,NULL,'2025-05-09 15:42:02','2025-05-09 15:42:02',NULL,'open',NULL,0,NULL,NULL,NULL),(6,10,'Muhammad\'s Business','','approved','H # 05 , Street # 1/5 , Gardezi Colony , Burma Town , Islamabad','','2025-05-10 15:15:40','2025-05-17 19:00:50','/uploads/logos/logo-1746893482729-698805189.jpg','open','',1,NULL,NULL,NULL),(7,16,'SAIMZAFAR',NULL,'approved',NULL,NULL,'2025-05-17 19:19:33','2025-05-17 19:19:51',NULL,'open',NULL,0,NULL,NULL,NULL);
/*!40000 ALTER TABLE `vendor_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist`
--

DROP TABLE IF EXISTS `wishlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_wishlist` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist`
--

LOCK TABLES `wishlist` WRITE;
/*!40000 ALTER TABLE `wishlist` DISABLE KEYS */;
INSERT INTO `wishlist` VALUES (1,11,12,'2025-05-11 04:16:18'),(4,11,13,'2025-05-18 13:50:57'),(6,11,7,'2025-05-18 13:58:01');
/*!40000 ALTER TABLE `wishlist` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-18 15:45:08
