-- ============================================================
-- 乌东文旅平台 · 数据库快照（结构 + 演示数据）
-- ============================================================
-- 数据库：wudong_platform（MySQL 8+，字符集 utf8mb4）
-- 内容：23 张表 + 113 行演示数据
--
-- 【重要】表结构由 TypeORM 按实体类自动生成（synchronize: true），
-- 本文件只是某一时刻的快照，不是权威 DDL。
-- 若修改了实体类，请重新导出本文件，不要手工改它。
--
-- 【如何导入】
--   ① 起容器： cd cool-admin-midway && docker compose up -d
--      （MySQL 映射在宿主机 3307 端口）
--   ② 导入：docker exec -i cool-admin-midway-coolDB-1 \
--             mysql -uroot -p123456 --default-character-set=utf8mb4 \
--             wudong_platform < wudong-platform/sql/wudong_platform.sql
--   ③ 后端配置指向 127.0.0.1:3307，库名 wudong_platform
--
-- 【注意】
-- - 本文件含用户密码哈希（bcrypt）与手机号，仅用于教学演示，
--   请勿在放入真实用户数据后继续提交此文件。
-- - 若只想重建结构、不要数据，请改用种子脚本
--   （wudong-server/src/scripts/seed-*.ts）。
-- - 导入会 DROP 并重建同名表，会覆盖目标库中的现有数据。
-- ============================================================


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
DROP TABLE IF EXISTS `app_address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_address` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `userId` int NOT NULL COMMENT '用户ID',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '收货人',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '手机号',
  `province` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '省份',
  `city` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '城市',
  `district` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '区县',
  `detail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '详细地址',
  `isDefault` int NOT NULL DEFAULT '0' COMMENT '是否默认 0-否 1-是',
  PRIMARY KEY (`id`),
  KEY `IDX_8ac710ae6b776e7ff7ff4ff79d` (`createTime`),
  KEY `IDX_ad40c30e94f2d7686866b442cc` (`updateTime`),
  KEY `IDX_90c5d756252bad43023111ac2e` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_address` WRITE;
/*!40000 ALTER TABLE `app_address` DISABLE KEYS */;
/*!40000 ALTER TABLE `app_address` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_admin` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '管理员账号',
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `nickname` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '管理员昵称',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '头像',
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manager' COMMENT '角色 admin-超级管理员 manager-运营管理',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '手机号',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态 0-禁用 1-启用',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_c2b722ea5f5fd931ea4f4e3dc6` (`username`),
  KEY `IDX_607315a81c02750401895dc4c5` (`createTime`),
  KEY `IDX_e65fac63565a42acf73ade9fab` (`updateTime`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_admin` WRITE;
/*!40000 ALTER TABLE `app_admin` DISABLE KEYS */;
INSERT INTO `app_admin` VALUES (1,'2026-09-10 09:01:44.477940','2026-09-10 09:01:44.477940','admin','$2a$10$PZhbcl3Ni/AG4yAdnQKv..Y97BrH1UMpp2HE0OYN7yEwGrBLNZrJy','超级管理员',NULL,'admin','13800138000',1),(2,'2026-09-10 09:01:44.489831','2026-09-10 09:01:44.489831','manager','$2a$10$PZhbcl3Ni/AG4yAdnQKv..Y97BrH1UMpp2HE0OYN7yEwGrBLNZrJy','运营管理员',NULL,'manager','13800138001',1);
/*!40000 ALTER TABLE `app_admin` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_category` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分类名称',
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '分类图标',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '分类描述',
  `sort` int NOT NULL DEFAULT '0' COMMENT '排序',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态 0-禁用 1-启用',
  PRIMARY KEY (`id`),
  KEY `IDX_9888ca0fdeb8fe7d2b44f624fc` (`createTime`),
  KEY `IDX_f86e8ea52e3a989ce2c206d09e` (`updateTime`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_category` WRITE;
/*!40000 ALTER TABLE `app_category` DISABLE KEYS */;
INSERT INTO `app_category` VALUES (1,'2026-09-10 17:36:23.724098','2026-09-10 17:36:23.724098','银饰','yinshi','苗族银饰精美的传统手工艺品',1,1),(2,'2026-09-10 17:36:23.741766','2026-09-10 17:36:23.741766','蜡染','laran','古老的防染工艺，布料上的艺术',2,1),(3,'2026-09-10 17:36:23.749439','2026-09-10 17:36:23.749439','刺绣','cixiu','苗族刺绣图案精美色彩绚丽',3,1),(4,'2026-09-10 17:36:23.756105','2026-09-10 17:36:23.756105','芦笙','lusheng','苗族传统乐器',4,1),(5,'2026-09-10 17:36:23.763146','2026-09-10 17:36:23.763146','竹编','zhubian','竹子编织的生活用品',5,1),(6,'2026-09-10 17:36:23.769553','2026-09-10 17:36:23.769553','服饰','fushi','苗族传统服饰和盛装',6,1);
/*!40000 ALTER TABLE `app_category` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_comment` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `postId` int NOT NULL COMMENT '帖子ID',
  `userId` int NOT NULL COMMENT '用户ID',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '评论内容',
  `replyUserId` int DEFAULT NULL COMMENT '回复目标用户ID',
  `likeCount` int NOT NULL DEFAULT '0' COMMENT '点赞数量',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态 0-隐藏 1-显示',
  PRIMARY KEY (`id`),
  KEY `IDX_7e8866f4655e5c80c5b2f5b4f7` (`createTime`),
  KEY `IDX_2f1d731e2b04091c3468f5b2b8` (`updateTime`),
  KEY `IDX_51dfbd0dd9a55d05c16092e420` (`postId`),
  KEY `IDX_88c43a1b54248db9d3dbe02851` (`userId`),
  KEY `FK_704c61b814fb7879bacf0bcd3d3` (`replyUserId`),
  CONSTRAINT `FK_51dfbd0dd9a55d05c16092e4203` FOREIGN KEY (`postId`) REFERENCES `app_post` (`id`),
  CONSTRAINT `FK_704c61b814fb7879bacf0bcd3d3` FOREIGN KEY (`replyUserId`) REFERENCES `app_user` (`id`),
  CONSTRAINT `FK_88c43a1b54248db9d3dbe02851d` FOREIGN KEY (`userId`) REFERENCES `app_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_comment` WRITE;
/*!40000 ALTER TABLE `app_comment` DISABLE KEYS */;
INSERT INTO `app_comment` VALUES (1,'2026-09-10 17:36:35.699065','2026-09-10 17:36:35.699065',1,2,'太美了！求攻略，下次也想去',NULL,0,1),(2,'2026-09-10 17:36:35.706362','2026-09-10 17:36:35.706362',1,7,'请问几点起床合适？需要带什么装备吗？',NULL,0,1),(3,'2026-09-10 17:36:35.713977','2026-09-10 17:36:35.713977',1,8,'这个角度拍得真好！',NULL,0,1),(4,'2026-09-10 17:36:35.721291','2026-09-10 17:36:35.721291',2,6,'蜡染体验看起来很有趣！价格贵吗？',NULL,0,1),(5,'2026-09-10 17:36:35.728338','2026-09-10 17:36:35.728338',2,2,'我也想体验！可以预约吗？',NULL,0,1),(6,'2026-09-10 17:36:35.735141','2026-09-10 17:36:35.735141',5,3,'篝火晚会太好玩了！',NULL,0,1),(7,'2026-09-10 17:36:35.742946','2026-09-10 17:36:35.742946',5,4,'每周都有吗？',NULL,0,1),(8,'2026-09-10 17:36:35.750311','2026-09-10 17:36:35.750311',5,6,'能教教我那个舞步吗？',NULL,0,1),(9,'2026-09-10 17:36:35.758345','2026-09-10 17:36:35.758345',5,8,'氛围太好了！',NULL,0,1);
/*!40000 ALTER TABLE `app_comment` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_config` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `configKey` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置键',
  `configValue` text COLLATE utf8mb4_unicode_ci COMMENT '配置值',
  `configName` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '配置名称',
  `group` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '配置分组',
  `configType` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string' COMMENT '配置类型 string/number/boolean/json',
  `remark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_3bf26f68cf1cfd614cc4f5a676` (`configKey`),
  KEY `IDX_9b3f7d1c78e1e2c35603d20fdf` (`createTime`),
  KEY `IDX_7ea53f957aee3a912267962dab` (`updateTime`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_config` WRITE;
/*!40000 ALTER TABLE `app_config` DISABLE KEYS */;
INSERT INTO `app_config` VALUES (2,'2026-09-10 15:10:38.160561','2026-09-10 15:10:40.000000','site_website','{\"siteName\":\"乌东文旅综合服务平台\",\"logo\":\"\",\"description\":\"乌东村文化旅游综合服务平台，为您提供最地道的苗族侗族文化体验\",\"keywords\":\"乌东村,苗族文化,侗族文化,旅游,非遗,民宿,餐饮\"}','site_website','default','json',NULL);
/*!40000 ALTER TABLE `app_config` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_dish`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_dish` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '菜品名称',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '菜品描述',
  `coverImage` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '菜品图片',
  `price` int NOT NULL DEFAULT '0' COMMENT '价格(分)',
  `originalPrice` int DEFAULT NULL COMMENT '原价(分)',
  `restaurantId` int NOT NULL COMMENT '餐厅ID',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '菜品分类 如:招牌菜/凉菜/主食',
  `stock` int NOT NULL DEFAULT '0' COMMENT '库存',
  `salesCount` int NOT NULL DEFAULT '0' COMMENT '销量',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态 0-售罄 1-在售',
  PRIMARY KEY (`id`),
  KEY `IDX_53def84112b5954f551b8774c6` (`createTime`),
  KEY `IDX_80e0790c3e22f117a0a2b1f105` (`updateTime`),
  KEY `IDX_c2793e97de900983f67c821408` (`name`),
  KEY `IDX_454cacd9c50270236e9f45c3a5` (`restaurantId`),
  CONSTRAINT `FK_454cacd9c50270236e9f45c3a51` FOREIGN KEY (`restaurantId`) REFERENCES `app_restaurant` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_dish` WRITE;
/*!40000 ALTER TABLE `app_dish` DISABLE KEYS */;
INSERT INTO `app_dish` VALUES (1,'2026-09-10 17:36:26.794362','2026-09-10 17:36:26.794362','酸汤鱼','苗家招牌酸汤鱼','https://images.pexels.com/photos/17130431/pexels-photo-17130431.jpeg?auto=compress&cs=tinysrgb&w=800',8800,NULL,1,'招牌菜',50,0,1),(2,'2026-09-10 17:36:26.800710','2026-09-10 17:36:26.800710','苗家腊肉','传统苗族腌制腊肉','https://images.pexels.com/photos/19688911/pexels-photo-19688911.jpeg?auto=compress&cs=tinysrgb&w=800',4800,NULL,1,'特色菜',50,0,1),(3,'2026-09-10 17:36:26.806698','2026-09-10 17:36:26.806698','腌鱼','苗家传统腌鱼','https://images.pexels.com/photos/20089298/pexels-photo-20089298.jpeg?auto=compress&cs=tinysrgb&w=800',5800,NULL,1,'特色菜',50,0,1),(4,'2026-09-10 17:36:26.813890','2026-09-10 17:36:26.813890','野菜汤','新鲜山野蔬菜汤','https://images.pexels.com/photos/6646157/pexels-photo-6646157.jpeg?auto=compress&cs=tinysrgb&w=800',1800,NULL,1,'汤类',50,0,1),(5,'2026-09-10 17:36:26.819749','2026-09-10 17:36:26.819749','侗家腌肉','侗族特色腌肉','https://images.pexels.com/photos/19688911/pexels-photo-19688911.jpeg?auto=compress&cs=tinysrgb&w=800',5800,NULL,2,'招牌菜',50,0,1),(6,'2026-09-10 17:36:26.824950','2026-09-10 17:36:26.824950','糯米糍粑','手工糯米糍粑','https://images.pexels.com/photos/37464600/pexels-photo-37464600.jpeg?auto=compress&cs=tinysrgb&w=800',2800,NULL,2,'主食',50,0,1),(7,'2026-09-10 17:36:26.830555','2026-09-10 17:36:26.830555','香禾糯米饭','从江香禾糯米','https://images.pexels.com/photos/37332347/pexels-photo-37332347.jpeg?auto=compress&cs=tinysrgb&w=800',1500,NULL,2,'主食',50,0,1),(8,'2026-09-10 17:36:26.835887','2026-09-10 17:36:26.835887','酸菜扣肉','侗家酸菜扣肉','https://images.pexels.com/photos/34474143/pexels-photo-34474143.jpeg?auto=compress&cs=tinysrgb&w=800',6800,NULL,2,'招牌菜',50,0,1),(9,'2026-09-10 17:36:26.841060','2026-09-10 17:36:26.841060','牛瘪火锅','黔东南特色牛瘪','https://images.pexels.com/photos/17130431/pexels-photo-17130431.jpeg?auto=compress&cs=tinysrgb&w=800',12800,NULL,3,'招牌菜',50,0,1),(10,'2026-09-10 17:36:26.846687','2026-09-10 17:36:26.846687','黄牛肉片','新鲜黄牛肉','https://images.pexels.com/photos/37032054/pexels-photo-37032054.jpeg?auto=compress&cs=tinysrgb&w=800',8800,NULL,3,'涮菜',50,0,1),(11,'2026-09-10 17:36:26.852242','2026-09-10 17:36:26.852242','牛杂拼盘','牛下水拼盘','https://images.pexels.com/photos/37100216/pexels-photo-37100216.jpeg?auto=compress&cs=tinysrgb&w=800',5800,NULL,3,'涮菜',50,0,1),(12,'2026-09-10 17:36:26.858220','2026-09-10 17:36:26.858220','野菜拼盘','新鲜野菜','https://images.pexels.com/photos/38909062/pexels-photo-38909062.jpeg?auto=compress&cs=tinysrgb&w=800',2200,NULL,3,'涮菜',50,0,1),(13,'2026-09-10 17:36:26.863430','2026-09-10 17:36:26.863430','禾花鱼','稻田禾花鱼','https://images.pexels.com/photos/11653557/pexels-photo-11653557.jpeg?auto=compress&cs=tinysrgb&w=800',6800,NULL,4,'招牌菜',50,0,1),(14,'2026-09-10 17:36:26.868662','2026-09-10 17:36:26.868662','稻田鸭','稻田放养鸭','https://images.pexels.com/photos/4083580/pexels-photo-4083580.jpeg?auto=compress&cs=tinysrgb&w=800',8800,NULL,4,'招牌菜',50,0,1),(15,'2026-09-10 17:36:26.873561','2026-09-10 17:36:26.873561','时令野菜','当日新鲜野菜','https://images.pexels.com/photos/36676215/pexels-photo-36676215.jpeg?auto=compress&cs=tinysrgb&w=800',1200,NULL,4,'素菜',50,0,1),(16,'2026-09-10 17:36:26.878732','2026-09-10 17:36:26.878732','糯米酒','苗家糯米酒','https://images.pexels.com/photos/35643789/pexels-photo-35643789.png?auto=compress&cs=tinysrgb&w=800',2000,NULL,4,'酒水',50,0,1);
/*!40000 ALTER TABLE `app_dish` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_favorite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_favorite` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `userId` int NOT NULL COMMENT '用户ID',
  `favoriteType` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '收藏类型 post-帖子 product-商品 hotel-民宿 restaurant-餐厅',
  `relatedId` int NOT NULL COMMENT '关联ID',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态 0-取消 1-收藏',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_0f91dda4bec0d1eed6f5e1c7fb` (`userId`,`favoriteType`,`relatedId`),
  KEY `IDX_cc328fec5fb595b1adc8f9bc76` (`createTime`),
  KEY `IDX_801eb8250090cd0f9141afff62` (`updateTime`),
  KEY `IDX_62290c951be4c923d30ab21b1b` (`userId`),
  KEY `IDX_b7fe4f9f8319c9302e67885b52` (`relatedId`),
  CONSTRAINT `FK_62290c951be4c923d30ab21b1b2` FOREIGN KEY (`userId`) REFERENCES `app_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_favorite` WRITE;
/*!40000 ALTER TABLE `app_favorite` DISABLE KEYS */;
/*!40000 ALTER TABLE `app_favorite` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_hotel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_hotel` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '民宿名称',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '民宿描述',
  `coverImage` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '封面图',
  `images` text COLLATE utf8mb4_unicode_ci COMMENT '图片(JSON)',
  `address` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '地址',
  `longitude` decimal(10,6) DEFAULT NULL COMMENT '经度',
  `latitude` decimal(10,6) DEFAULT NULL COMMENT '纬度',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系电话',
  `merchantId` int DEFAULT NULL COMMENT '商家ID',
  `hotelType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '民宿类型 如:吊脚楼/木楼/现代',
  `tags` text COLLATE utf8mb4_unicode_ci COMMENT '特色标签(JSON)',
  `checkInTime` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '14:00' COMMENT '入住时间',
  `checkOutTime` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '12:00' COMMENT '退房时间',
  `minPrice` int DEFAULT NULL COMMENT '最低价格(分)',
  `rating` int NOT NULL DEFAULT '5' COMMENT '评分 1-5',
  `ratingCount` int NOT NULL DEFAULT '0' COMMENT '评分数量',
  `favoriteCount` int NOT NULL DEFAULT '0' COMMENT '收藏数量',
  `environment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '环境描述',
  `facilities` text COLLATE utf8mb4_unicode_ci COMMENT '配套设施(JSON)',
  `nearbyScenery` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '周围景观',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态 0-歇业 1-营业',
  `isRecommend` int NOT NULL DEFAULT '0' COMMENT '是否推荐 0-否 1-是',
  PRIMARY KEY (`id`),
  KEY `IDX_9943d924170b9a38b62d26f40a` (`createTime`),
  KEY `IDX_6daa7ba86fe8f50fbe1ea34f9b` (`updateTime`),
  KEY `IDX_48f42acebd297bc91bba622e0c` (`name`),
  KEY `IDX_a3345748522bd12e93b47e969f` (`merchantId`),
  CONSTRAINT `FK_a3345748522bd12e93b47e969fa` FOREIGN KEY (`merchantId`) REFERENCES `app_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_hotel` WRITE;
/*!40000 ALTER TABLE `app_hotel` DISABLE KEYS */;
INSERT INTO `app_hotel` VALUES (1,'2026-09-10 17:36:29.850216','2026-09-10 17:36:29.850216','乌东吊脚楼客栈','依山而建的苗家吊脚楼，推窗可见层层梯田，体验原生态苗寨生活，感受千年苗族建筑智慧','https://images.pexels.com/photos/36647675/pexels-photo-36647675.jpeg?auto=compress&cs=tinysrgb&w=800','[\"https://images.pexels.com/photos/36647675/pexels-photo-36647675.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/38186695/pexels-photo-38186695.jpeg?auto=compress&cs=tinysrgb&w=800\"]','乌东村一组观景台旁',108.683800,26.488200,'0855-8234561',NULL,'吊脚楼','[\"观景\",\"苗族特色\",\"原生态\"]','14:00','12:00',29800,5,0,0,'依山傍水，梯田环绕','[\"免费WiFi\",\"热水\",\"早餐\",\"停车场\"]','观景台、梯田风光',1,1),(2,'2026-09-10 17:36:29.863851','2026-09-10 17:36:29.863851','侗家木楼民宿','传统侗族木楼建筑，冬暖夏凉，感受侗族人民的热情好客，体验侗族鼓楼文化','https://images.pexels.com/photos/17801941/pexels-photo-17801941.jpeg?auto=compress&cs=tinysrgb&w=800','[\"https://images.pexels.com/photos/17801941/pexels-photo-17801941.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/1565326/pexels-photo-1565326.jpeg?auto=compress&cs=tinysrgb&w=800\"]','乌东村二组侗寨鼓楼旁',108.686200,26.490200,'0855-8234562',NULL,'木楼','[\"侗族特色\",\"鼓楼旁\",\"文化体验\"]','14:00','12:00',19800,5,0,0,'侗寨中心，鼓楼为伴','[\"免费WiFi\",\"热水\",\"侗族歌舞表演\"]','侗族鼓楼、风雨桥',1,1),(3,'2026-09-10 17:36:29.870641','2026-09-10 17:36:29.870641','乌东梯田观景民宿','位于半山腰的精品民宿，视野开阔，是观赏日出云海的绝佳位置，摄影爱好者的天堂','https://images.pexels.com/photos/14025188/pexels-photo-14025188.jpeg?auto=compress&cs=tinysrgb&w=800','[\"https://images.pexels.com/photos/14025188/pexels-photo-14025188.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/35428411/pexels-photo-35428411.jpeg?auto=compress&cs=tinysrgb&w=800\"]','乌东村三组半山',108.681800,26.486800,'0855-8234563',NULL,'现代与传统结合','[\"观日出\",\"云海\",\"摄影胜地\"]','14:00','12:00',39800,5,0,0,'半山之巅，视野绝佳','[\"免费WiFi\",\"热水\",\"观景平台\",\"摄影指导\"]','日出云海、梯田全景',1,1),(4,'2026-09-10 17:36:29.880013','2026-09-10 17:36:29.880013','苗家田园客栈','稻田环绕的田园民宿，清晨闻鸡鸣而起，夜晚听蛙声入睡，体验农耕文化','https://images.pexels.com/photos/33677662/pexels-photo-33677662.jpeg?auto=compress&cs=tinysrgb&w=800','[\"https://images.pexels.com/photos/33677662/pexels-photo-33677662.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/39198174/pexels-photo-39198174.jpeg?auto=compress&cs=tinysrgb&w=800\"]','乌东村四组农田旁',108.688500,26.491800,'0855-8234564',NULL,'田园风格','[\"田园风光\",\"农耕体验\",\"亲子游\"]','14:00','12:00',16800,5,0,0,'稻田环绕，蛙鸣阵阵','[\"免费WiFi\",\"热水\",\"农家早餐\",\"农耕体验\"]','稻田、菜园、溪流',1,0);
/*!40000 ALTER TABLE `app_hotel` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_hotel_review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_hotel_review` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `hotelId` int NOT NULL COMMENT '民宿ID',
  `userId` int NOT NULL COMMENT '用户ID',
  `rating` int NOT NULL DEFAULT '5' COMMENT '评分 1-5',
  `content` text COLLATE utf8mb4_unicode_ci COMMENT '评论内容',
  `images` text COLLATE utf8mb4_unicode_ci COMMENT '评论图片(JSON)',
  `checkInDate` date DEFAULT NULL COMMENT '入住日期',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态 0-隐藏 1-显示',
  PRIMARY KEY (`id`),
  KEY `IDX_f6dbbec57612595d6f0b26c251` (`createTime`),
  KEY `IDX_ae212aa59068bb1b3ac3523a8c` (`updateTime`),
  KEY `IDX_13dd77ef59c9815286f42ab2df` (`hotelId`),
  KEY `IDX_909286fb0b7c5d109b053fbd3d` (`userId`),
  CONSTRAINT `FK_13dd77ef59c9815286f42ab2df7` FOREIGN KEY (`hotelId`) REFERENCES `app_hotel` (`id`),
  CONSTRAINT `FK_909286fb0b7c5d109b053fbd3d0` FOREIGN KEY (`userId`) REFERENCES `app_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_hotel_review` WRITE;
/*!40000 ALTER TABLE `app_hotel_review` DISABLE KEYS */;
/*!40000 ALTER TABLE `app_hotel_review` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_like`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_like` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `userId` int NOT NULL COMMENT '用户ID',
  `likeType` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '点赞类型 post-帖子 comment-评论',
  `relatedId` int NOT NULL COMMENT '关联ID(帖子或评论ID)',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态 0-取消 1-点赞',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_18dbd276e4a1725984e89c1986` (`userId`,`likeType`,`relatedId`),
  KEY `IDX_bf27c4b2cdb6d3d7ccdc6399a2` (`createTime`),
  KEY `IDX_9460bab7bec12cd2845e4707f0` (`updateTime`),
  KEY `IDX_cc9e45c2101ef6cd7c9f057865` (`userId`),
  KEY `IDX_7d4f9e22fc82a438ff4a8074e4` (`relatedId`),
  CONSTRAINT `FK_cc9e45c2101ef6cd7c9f0578650` FOREIGN KEY (`userId`) REFERENCES `app_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_like` WRITE;
/*!40000 ALTER TABLE `app_like` DISABLE KEYS */;
INSERT INTO `app_like` VALUES (1,'2026-09-10 17:36:35.765822','2026-09-10 17:36:35.765822',1,'post',1,1),(2,'2026-09-10 17:36:35.773054','2026-09-10 17:36:35.773054',2,'post',1,1),(3,'2026-09-10 17:36:35.779906','2026-09-10 17:36:35.779906',3,'post',1,1),(4,'2026-09-10 17:36:35.787273','2026-09-10 17:36:35.787273',4,'post',1,1),(5,'2026-09-10 17:36:35.794790','2026-09-10 17:36:35.794790',5,'post',1,1),(6,'2026-09-10 17:36:35.803060','2026-09-10 17:36:35.803060',7,'post',1,1),(7,'2026-09-10 17:36:35.819065','2026-09-10 17:36:35.819065',1,'post',2,1),(8,'2026-09-10 17:36:35.826128','2026-09-10 17:36:35.826128',2,'post',2,1),(9,'2026-09-10 17:36:35.833345','2026-09-10 17:36:35.833345',4,'post',2,1),(10,'2026-09-10 17:36:35.840814','2026-09-10 17:36:35.840814',5,'post',2,1),(11,'2026-09-10 17:36:35.854691','2026-09-10 17:36:35.854691',1,'post',3,1),(12,'2026-09-10 17:36:35.862102','2026-09-10 17:36:35.862102',2,'post',3,1),(13,'2026-09-10 17:36:35.868576','2026-09-10 17:36:35.868576',3,'post',3,1),(14,'2026-09-10 17:36:35.875035','2026-09-10 17:36:35.875035',4,'post',3,1),(15,'2026-09-10 17:36:35.881808','2026-09-10 17:36:35.881808',5,'post',3,1),(16,'2026-09-10 17:36:35.893551','2026-09-10 17:36:35.893551',1,'post',4,1),(17,'2026-09-10 17:36:35.900480','2026-09-10 17:36:35.900480',2,'post',4,1),(18,'2026-09-10 17:36:35.907136','2026-09-10 17:36:35.907136',3,'post',4,1),(19,'2026-09-10 17:36:35.919762','2026-09-10 17:36:35.919762',1,'post',5,1),(20,'2026-09-10 17:36:35.926623','2026-09-10 17:36:35.926623',3,'post',5,1),(21,'2026-09-10 17:36:35.933058','2026-09-10 17:36:35.933058',4,'post',5,1),(22,'2026-09-10 17:36:35.939926','2026-09-10 17:36:35.939926',5,'post',5,1),(23,'2026-09-10 17:36:35.946557','2026-09-10 17:36:35.946557',6,'post',5,1),(24,'2026-09-10 17:36:35.952650','2026-09-10 17:36:35.952650',7,'post',5,1),(25,'2026-09-10 17:36:35.959850','2026-09-10 17:36:35.959850',8,'post',5,1),(26,'2026-09-10 17:36:35.971847','2026-09-10 17:36:35.971847',1,'post',6,1),(27,'2026-09-10 17:36:35.978276','2026-09-10 17:36:35.978276',2,'post',6,1),(28,'2026-09-10 17:36:35.984516','2026-09-10 17:36:35.984516',3,'post',6,1),(29,'2026-09-10 17:36:35.993592','2026-09-10 17:36:35.993592',5,'post',6,1);
/*!40000 ALTER TABLE `app_like` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_log` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `adminId` int DEFAULT NULL COMMENT '管理员ID',
  `adminName` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '管理员名称',
  `action` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '操作类型',
  `content` text COLLATE utf8mb4_unicode_ci COMMENT '操作内容',
  `ip` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP地址',
  `params` text COLLATE utf8mb4_unicode_ci COMMENT '请求参数',
  `result` int NOT NULL DEFAULT '1' COMMENT '操作结果 0-失败 1-成功',
  PRIMARY KEY (`id`),
  KEY `IDX_5645ca8d4f05cb05cdae33bd35` (`createTime`),
  KEY `IDX_791d5411620598bba08cd73656` (`updateTime`),
  KEY `IDX_b619a1f513072fa4ac34c4b115` (`adminId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_log` WRITE;
/*!40000 ALTER TABLE `app_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `app_log` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_message` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `userId` int NOT NULL COMMENT '用户ID',
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'system' COMMENT '类型 system-系统 order-订单 interact-互动',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '标题',
  `content` text COLLATE utf8mb4_unicode_ci COMMENT '内容',
  `isRead` int NOT NULL DEFAULT '0' COMMENT '是否已读 0-未读 1-已读',
  PRIMARY KEY (`id`),
  KEY `IDX_5f1d04195f020907d6145ffa6e` (`createTime`),
  KEY `IDX_2449985feaff4fe2d2a1317934` (`updateTime`),
  KEY `IDX_fdb36c0c1c3391bcee87b52af1` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_message` WRITE;
/*!40000 ALTER TABLE `app_message` DISABLE KEYS */;
/*!40000 ALTER TABLE `app_message` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_order` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `orderNo` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '订单编号',
  `userId` int NOT NULL COMMENT '用户ID',
  `orderType` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '订单类型 ticket-票务 hotel-住宿 product-商品 restaurant-餐饮',
  `relatedId` int DEFAULT NULL COMMENT '关联ID(票务/住宿/商品/餐厅ID)',
  `relatedName` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联名称',
  `quantity` int NOT NULL DEFAULT '1' COMMENT '数量',
  `unitPrice` int NOT NULL DEFAULT '0' COMMENT '单价(分)',
  `totalPrice` int NOT NULL DEFAULT '0' COMMENT '总价(分)',
  `bookDate` date DEFAULT NULL COMMENT '预订日期/入住日期',
  `endDate` date DEFAULT NULL COMMENT '结束日期(退房日期)',
  `contactName` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系人姓名',
  `contactPhone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系人电话',
  `remark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `orderStatus` int NOT NULL DEFAULT '1' COMMENT '订单状态 0-已取消 1-待支付 2-已支付 3-已完成 4-已退款',
  `payMethod` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '支付方式 wx-微信 zfb-支付宝',
  `payTime` datetime DEFAULT NULL COMMENT '支付时间',
  `cancelReason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '取消原因',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_3e6144a17a848a8a010a5b6f50` (`orderNo`),
  KEY `IDX_d40ac325f33a6221d363824eb9` (`createTime`),
  KEY `IDX_e35cdb747d02ac54dea1e5e08b` (`updateTime`),
  KEY `IDX_eaf47de34d3768961b4ceb1b72` (`userId`),
  CONSTRAINT `FK_eaf47de34d3768961b4ceb1b72f` FOREIGN KEY (`userId`) REFERENCES `app_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_order` WRITE;
/*!40000 ALTER TABLE `app_order` DISABLE KEYS */;
/*!40000 ALTER TABLE `app_order` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_post` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `userId` int NOT NULL COMMENT '用户ID',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '帖子内容',
  `images` text COLLATE utf8mb4_unicode_ci COMMENT '图片(JSON)',
  `video` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '视频URL',
  `postType` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'photo' COMMENT '帖子类型 photo-照片 video-视频',
  `tags` text COLLATE utf8mb4_unicode_ci COMMENT '标签(JSON)',
  `likeCount` int NOT NULL DEFAULT '0' COMMENT '点赞数量',
  `commentCount` int NOT NULL DEFAULT '0' COMMENT '评论数量',
  `favoriteCount` int NOT NULL DEFAULT '0' COMMENT '收藏数量',
  `viewCount` int NOT NULL DEFAULT '0' COMMENT '浏览量',
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '地理位置',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态 0-隐藏 1-显示',
  `isFeatured` int NOT NULL DEFAULT '0' COMMENT '是否精华 0-否 1-是',
  PRIMARY KEY (`id`),
  KEY `IDX_96f89d3f7fe0a6cc3e96dc7eab` (`createTime`),
  KEY `IDX_e2fcacbad7c2110a35dff88f5e` (`updateTime`),
  KEY `IDX_f62d523f3288e61d7457a12fe2` (`userId`),
  KEY `IDX_4a929e5cda462fe8220c63db2d` (`likeCount`),
  KEY `IDX_4e4ba875e5013bd858869903b6` (`commentCount`),
  CONSTRAINT `FK_f62d523f3288e61d7457a12fe22` FOREIGN KEY (`userId`) REFERENCES `app_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_post` WRITE;
/*!40000 ALTER TABLE `app_post` DISABLE KEYS */;
INSERT INTO `app_post` VALUES (1,'2026-09-10 17:36:35.642490','2026-09-10 17:43:15.000000',6,'乌东梯田的日出真的太美了！清晨五点半登山，看到云海翻涌，太阳从山那边慢慢升起，金色的阳光洒在层层梯田上，简直像仙境一样。下次还要再来！','[\"https://images.pexels.com/photos/2161540/pexels-photo-2161540.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/34902075/pexels-photo-34902075.jpeg?auto=compress&cs=tinysrgb&w=800\"]',NULL,'photo','[\"乌东梯田\",\"日出\",\"摄影\"]',6,3,0,158,'乌东村',1,1),(2,'2026-09-10 17:36:35.658176','2026-09-10 17:36:35.000000',3,'今天在苗家体验了蜡染技艺，太有意思了！老师傅手把手教，从绘制图案到染色，每一步都很有讲究。做出了自己专属的蜡染方巾，带回家做纪念！','[\"https://images.pexels.com/photos/34161634/pexels-photo-34161634.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/37853658/pexels-photo-37853658.jpeg?auto=compress&cs=tinysrgb&w=800\"]',NULL,'photo','[\"蜡染\",\"非遗体验\",\"苗族\"]',4,2,0,89,'苗家蜡染体验坊',1,1),(3,'2026-09-10 17:36:35.668718','2026-09-10 17:36:35.000000',8,'住在吊脚楼客栈的第一晚，听着窗外的蛙鸣和溪水声入睡，这种感觉太治愈了。远离城市的喧嚣，回归大自然，这就是向往的生活吧。','[\"https://images.pexels.com/photos/754186/pexels-photo-754186.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/6550304/pexels-photo-6550304.jpeg?auto=compress&cs=tinysrgb&w=800\"]',NULL,'photo','[\"吊脚楼\",\"民宿\",\"田园生活\"]',5,0,0,203,'乌东吊脚楼客栈',1,1),(4,'2026-09-10 17:36:35.677360','2026-09-10 17:36:35.000000',7,'苗家酸汤鱼，味道绝了！酸辣开胃，鱼肉鲜嫩，配上当地的野菜，一口气吃了两碗饭。强烈推荐大家来尝尝！','[\"https://images.pexels.com/photos/33471753/pexels-photo-33471753.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/36061263/pexels-photo-36061263.jpeg?auto=compress&cs=tinysrgb&w=800\"]',NULL,'photo','[\"酸汤鱼\",\"苗族美食\",\"美食推荐\"]',3,0,0,78,'苗家酸汤鱼庄',1,0),(5,'2026-09-10 17:36:35.684716','2026-09-10 17:36:35.000000',2,'篝火晚会上和当地苗族同胞一起跳舞，太欢乐了！他们都很热情好客，歌声嘹亮，舞姿优美。虽然动作笨拙，但是很开心！','[\"https://images.pexels.com/photos/34408549/pexels-photo-34408549.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/4276087/pexels-photo-4276087.jpeg?auto=compress&cs=tinysrgb&w=800\"]',NULL,'photo','[\"篝火晚会\",\"苗族歌舞\",\"文化体验\"]',7,4,0,245,'乌东村文化广场',1,1),(6,'2026-09-10 17:36:35.691753','2026-09-10 17:46:27.459882',4,'乌东古寨真的太有历史感了！几百年的吊脚楼保存完好，斑驳的木墙诉说着岁月的故事。漫步在青石板路上，仿佛穿越到了过去。','[\"https://images.pexels.com/photos/5642978/pexels-photo-5642978.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/7146295/pexels-photo-7146295.jpeg?auto=compress&cs=tinysrgb&w=800\"]',NULL,'photo','[\"古寨\",\"吊脚楼\",\"历史\"]',4,0,0,114,'乌东古寨',1,0);
/*!40000 ALTER TABLE `app_post` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_product` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '商品名称',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '商品描述',
  `price` int NOT NULL DEFAULT '0' COMMENT '商品价格(分)',
  `originalPrice` int DEFAULT NULL COMMENT '原价(分)',
  `images` text COLLATE utf8mb4_unicode_ci COMMENT '商品图片(JSON数组)',
  `coverImage` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '商品封面图',
  `stock` int NOT NULL DEFAULT '0' COMMENT '库存数量',
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '件' COMMENT '单位',
  `categoryId` int DEFAULT NULL COMMENT '分类ID',
  `merchantId` int DEFAULT NULL COMMENT '商家ID',
  `heritageLevel` int NOT NULL DEFAULT '0' COMMENT '非遗级别 0-普通 1-县级 2-州级 3-省级 4-国家级',
  `heritageDesc` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '非遗工艺描述',
  `viewCount` int NOT NULL DEFAULT '0' COMMENT '浏览量',
  `salesCount` int NOT NULL DEFAULT '0' COMMENT '销量',
  `detail` text COLLATE utf8mb4_unicode_ci COMMENT '商品详情(富文本)',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态 0-下架 1-上架',
  `isRecommend` int NOT NULL DEFAULT '0' COMMENT '是否推荐 0-否 1-是',
  PRIMARY KEY (`id`),
  KEY `IDX_661bdeb4eddf97709a6daa26c3` (`createTime`),
  KEY `IDX_126efe0439234e754e3db20ff2` (`updateTime`),
  KEY `IDX_4b53de8394a9d49d1cd536576b` (`name`),
  KEY `IDX_70bb0d91221c08af4d01838f96` (`categoryId`),
  KEY `IDX_0a81331eaa2f308fc850b15a5e` (`merchantId`),
  CONSTRAINT `FK_0a81331eaa2f308fc850b15a5ed` FOREIGN KEY (`merchantId`) REFERENCES `app_user` (`id`),
  CONSTRAINT `FK_70bb0d91221c08af4d01838f969` FOREIGN KEY (`categoryId`) REFERENCES `app_category` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_product` WRITE;
/*!40000 ALTER TABLE `app_product` DISABLE KEYS */;
INSERT INTO `app_product` VALUES (1,'2026-09-10 17:36:23.778036','2026-09-10 17:42:58.000000','苗族银凤冠','纯手工打造的传统苗族银凤冠，象征吉祥如意，采用千年传承的苗族银饰锻造技艺',128800,158800,'[\"https://images.pexels.com/photos/14802898/pexels-photo-14802898.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/39452381/pexels-photo-39452381.jpeg?auto=compress&cs=tinysrgb&w=800\"]','https://images.pexels.com/photos/14802898/pexels-photo-14802898.jpeg?auto=compress&cs=tinysrgb&w=800',5,'顶',1,NULL,3,'省级非物质文化遗产',2,0,NULL,1,1),(2,'2026-09-10 17:36:23.786836','2026-09-10 17:36:23.786836','手工蜡染布匹','采用古法蓝靛蜡染技艺，天然植物染料，每一寸布料都承载着苗族古老的智慧',3800,4800,'[\"https://images.pexels.com/photos/34583535/pexels-photo-34583535.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/37896840/pexels-photo-37896840.jpeg?auto=compress&cs=tinysrgb&w=800\"]','https://images.pexels.com/photos/34583535/pexels-photo-34583535.jpeg?auto=compress&cs=tinysrgb&w=800',50,'米',2,NULL,2,'州级非物质文化遗产',0,0,NULL,1,1),(3,'2026-09-10 17:36:23.793337','2026-09-10 17:36:23.793337','苗绣披肩','精湛的苗族刺绣技艺，图案取材于苗族古歌，每一针都是对传统的致敬',68800,88800,'[\"https://images.pexels.com/photos/17881567/pexels-photo-17881567.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/29000643/pexels-photo-29000643.jpeg?auto=compress&cs=tinysrgb&w=800\"]','https://images.pexels.com/photos/17881567/pexels-photo-17881567.jpeg?auto=compress&cs=tinysrgb&w=800',30,'条',3,NULL,2,'州级非物质文化遗产',0,0,NULL,1,1),(4,'2026-09-10 17:36:23.799599','2026-09-10 17:36:23.799599','六管芦笙','传统苗族六管芦笙，音质浑厚悠扬，是苗族文化的重要符号',128000,158000,'[\"https://images.pexels.com/photos/11111338/pexels-photo-11111338.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/37686907/pexels-photo-37686907.jpeg?auto=compress&cs=tinysrgb&w=800\"]','https://images.pexels.com/photos/11111338/pexels-photo-11111338.jpeg?auto=compress&cs=tinysrgb&w=800',15,'支',4,NULL,3,'省级非物质文化遗产',0,0,NULL,1,0),(5,'2026-09-10 17:36:23.805723','2026-09-10 17:36:23.805723','竹编手提篮','精选楠竹手工编织，环保实用，传承千年的竹编工艺',16800,19800,'[\"https://images.pexels.com/photos/28849646/pexels-photo-28849646.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/26692156/pexels-photo-26692156.jpeg?auto=compress&cs=tinysrgb&w=800\"]','https://images.pexels.com/photos/28849646/pexels-photo-28849646.jpeg?auto=compress&cs=tinysrgb&w=800',80,'个',5,NULL,1,'县级非物质文化遗产',0,0,NULL,1,0),(6,'2026-09-10 17:36:23.812177','2026-09-10 17:36:23.812177','苗族百鸟衣','苗族盛装礼服，刺绣精美工艺精湛，被誉为穿在身上的史书',2680000,3280000,'[\"https://images.pexels.com/photos/20344888/pexels-photo-20344888.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/6324811/pexels-photo-6324811.jpeg?auto=compress&cs=tinysrgb&w=800\"]','https://images.pexels.com/photos/20344888/pexels-photo-20344888.jpeg?auto=compress&cs=tinysrgb&w=800',3,'套',6,NULL,4,'国家级非物质文化遗产',0,0,NULL,1,1),(7,'2026-09-10 17:36:23.818650','2026-09-10 17:36:23.818650','银饰耳环套装','苗族传统银耳环，蝴蝶纹样寓意吉祥，精美大方',58000,68000,'[\"https://images.pexels.com/photos/7509249/pexels-photo-7509249.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/5370642/pexels-photo-5370642.jpeg?auto=compress&cs=tinysrgb&w=800\"]','https://images.pexels.com/photos/7509249/pexels-photo-7509249.jpeg?auto=compress&cs=tinysrgb&w=800',40,'对',1,NULL,2,'州级非物质文化遗产',0,0,NULL,1,1),(8,'2026-09-10 17:36:23.825297','2026-09-10 17:45:48.000000','蜡染桌布套装','手工蜡染工艺，可用于家居装饰，独特的蓝白之美',26800,32800,'[\"https://images.pexels.com/photos/37723814/pexels-photo-37723814.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/28855659/pexels-photo-28855659.jpeg?auto=compress&cs=tinysrgb&w=800\"]','https://images.pexels.com/photos/37723814/pexels-photo-37723814.jpeg?auto=compress&cs=tinysrgb&w=800',60,'套',2,NULL,1,'县级非物质文化遗产',1,0,NULL,1,0);
/*!40000 ALTER TABLE `app_product` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_restaurant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_restaurant` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '餐厅名称',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '餐厅描述',
  `coverImage` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '餐厅封面图',
  `images` text COLLATE utf8mb4_unicode_ci COMMENT '餐厅图片(JSON)',
  `avgPrice` int DEFAULT NULL COMMENT '人均价格(分)',
  `address` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '地址',
  `longitude` decimal(10,6) DEFAULT NULL COMMENT '经度',
  `latitude` decimal(10,6) DEFAULT NULL COMMENT '纬度',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系电话',
  `businessHours` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '营业时间',
  `merchantId` int DEFAULT NULL COMMENT '商家ID',
  `rating` int NOT NULL DEFAULT '5' COMMENT '评分 1-5',
  `ratingCount` int NOT NULL DEFAULT '0' COMMENT '评分数量',
  `favoriteCount` int NOT NULL DEFAULT '0' COMMENT '收藏数量',
  `tags` text COLLATE utf8mb4_unicode_ci COMMENT '餐厅特色标签(JSON)',
  `environment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '环境描述',
  `specialties` text COLLATE utf8mb4_unicode_ci COMMENT '特色菜品(JSON)',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态 0-歇业 1-营业',
  `isRecommend` int NOT NULL DEFAULT '0' COMMENT '是否推荐 0-否 1-是',
  PRIMARY KEY (`id`),
  KEY `IDX_dfad43105bbd1df39f00c3b10e` (`createTime`),
  KEY `IDX_6054e5ec2bd470898aae16f599` (`updateTime`),
  KEY `IDX_c9fe773d57a10adf828a911585` (`name`),
  KEY `IDX_093638157d234e74b4a8a40111` (`merchantId`),
  CONSTRAINT `FK_093638157d234e74b4a8a401116` FOREIGN KEY (`merchantId`) REFERENCES `app_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_restaurant` WRITE;
/*!40000 ALTER TABLE `app_restaurant` DISABLE KEYS */;
INSERT INTO `app_restaurant` VALUES (1,'2026-09-10 17:36:26.764585','2026-09-10 17:36:26.764585','苗家酸汤鱼庄','正宗苗家酸汤鱼，采用苗族传统酸汤工艺，鲜美开胃，是体验苗族饮食文化的绝佳去处','https://images.pexels.com/photos/33965578/pexels-photo-33965578.png?auto=compress&cs=tinysrgb&w=800','[\"https://images.pexels.com/photos/33965578/pexels-photo-33965578.png?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/37047965/pexels-photo-37047965.jpeg?auto=compress&cs=tinysrgb&w=800\"]',5800,'乌东村一组',108.683200,26.487600,'0855-8234567','09:00-21:00',NULL,5,0,0,'[\"特色美食\",\"苗族风味\",\"酸汤系列\"]','依山傍水，吊脚楼风格','[\"酸汤鱼\",\"苗家腊肉\",\"腌鱼\"]',1,1),(2,'2026-09-10 17:36:26.775684','2026-09-10 17:36:26.775684','侗寨农家乐','侗族特色农家菜，食材取自当地农户，新鲜健康，体验侗族饮食智慧','https://images.pexels.com/photos/18414268/pexels-photo-18414268.jpeg?auto=compress&cs=tinysrgb&w=800','[\"https://images.pexels.com/photos/18414268/pexels-photo-18414268.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/6464535/pexels-photo-6464535.jpeg?auto=compress&cs=tinysrgb&w=800\"]',4500,'乌东村二组',108.685600,26.489100,'0855-8234568','10:00-20:00',NULL,5,0,0,'[\"农家菜\",\"侗族风味\",\"健康食材\"]','侗族木楼，庭院宽敞','[\"侗家腌肉\",\"糯米糍粑\",\"香禾糯米饭\"]',1,1),(3,'2026-09-10 17:36:26.782647','2026-09-10 17:36:26.782647','乌东牛瘪馆','黔东南特色牛瘪火锅，是待客上品，体验独特的民族美食','https://images.pexels.com/photos/19775602/pexels-photo-19775602.jpeg?auto=compress&cs=tinysrgb&w=800','[\"https://images.pexels.com/photos/19775602/pexels-photo-19775602.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/6339176/pexels-photo-6339176.jpeg?auto=compress&cs=tinysrgb&w=800\"]',6800,'乌东村三组',108.681200,26.485600,'0855-8234569','11:00-22:00',NULL,5,0,0,'[\"特色火锅\",\"必吃推荐\",\"传统美食\"]','古朴典雅，民族特色装饰','[\"牛瘪火锅\",\"黄牛肉\",\"牛杂\"]',1,1),(4,'2026-09-10 17:36:26.788626','2026-09-10 17:36:26.788626','禾花鱼农家院','稻田禾花鱼特色餐厅，体验苗寨田园风味，新鲜食材直供','https://images.pexels.com/photos/13326998/pexels-photo-13326998.jpeg?auto=compress&cs=tinysrgb&w=800','[\"https://images.pexels.com/photos/13326998/pexels-photo-13326998.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/14025934/pexels-photo-14025934.jpeg?auto=compress&cs=tinysrgb&w=800\"]',5200,'乌东村四组',108.687800,26.491200,'0855-8234570','09:30-20:30',NULL,5,0,0,'[\"田园风味\",\"禾花鱼\",\"时令蔬菜\"]','稻田环绕，田园风光','[\"禾花鱼\",\"稻田鸭\",\"时令野菜\"]',1,0);
/*!40000 ALTER TABLE `app_restaurant` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_restaurant_review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_restaurant_review` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `restaurantId` int NOT NULL COMMENT '餐厅ID',
  `userId` int NOT NULL COMMENT '用户ID',
  `rating` int NOT NULL DEFAULT '5' COMMENT '评分 1-5',
  `content` text COLLATE utf8mb4_unicode_ci COMMENT '评论内容',
  `images` text COLLATE utf8mb4_unicode_ci COMMENT '评论图片(JSON)',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态 0-隐藏 1-显示',
  PRIMARY KEY (`id`),
  KEY `IDX_9ff3c45ff50001eabd4095cd29` (`createTime`),
  KEY `IDX_a1f0c1f0766403783c28c9b60f` (`updateTime`),
  KEY `IDX_a7903419f779e6997e41c2047c` (`restaurantId`),
  KEY `IDX_a5809790bd2102ff5e9f0eef39` (`userId`),
  CONSTRAINT `FK_a5809790bd2102ff5e9f0eef392` FOREIGN KEY (`userId`) REFERENCES `app_user` (`id`),
  CONSTRAINT `FK_a7903419f779e6997e41c2047c3` FOREIGN KEY (`restaurantId`) REFERENCES `app_restaurant` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_restaurant_review` WRITE;
/*!40000 ALTER TABLE `app_restaurant_review` DISABLE KEYS */;
/*!40000 ALTER TABLE `app_restaurant_review` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_room` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间名称/房型',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '房间描述',
  `coverImage` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '封面图',
  `images` text COLLATE utf8mb4_unicode_ci COMMENT '图片(JSON)',
  `price` int NOT NULL DEFAULT '0' COMMENT '价格(分)/晚',
  `originalPrice` int DEFAULT NULL COMMENT '原价(分)',
  `hotelId` int NOT NULL COMMENT '民宿ID',
  `capacity` int NOT NULL DEFAULT '2' COMMENT '容纳人数',
  `bedType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '床型 如:大床/双床/榻榻米',
  `area` int DEFAULT NULL COMMENT '房间面积(平方米)',
  `floor` int DEFAULT NULL COMMENT '楼层',
  `stock` int NOT NULL DEFAULT '0' COMMENT '库存(房间数)',
  `facilities` text COLLATE utf8mb4_unicode_ci COMMENT '配套设施(JSON)',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态 0-不可预订 1-可预订',
  PRIMARY KEY (`id`),
  KEY `IDX_7861413c990241c667e3304ebc` (`createTime`),
  KEY `IDX_a2fd553575c129cc765c0066be` (`updateTime`),
  KEY `IDX_5cf49954b288629aeea93fa6c8` (`name`),
  KEY `IDX_f5bf083ddcf968305b8cce8943` (`hotelId`),
  CONSTRAINT `FK_f5bf083ddcf968305b8cce89437` FOREIGN KEY (`hotelId`) REFERENCES `app_hotel` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_room` WRITE;
/*!40000 ALTER TABLE `app_room` DISABLE KEYS */;
INSERT INTO `app_room` VALUES (1,'2026-09-10 17:36:29.887206','2026-09-10 17:36:29.887206','观景大床房','推窗即见梯田','https://images.pexels.com/photos/30835932/pexels-photo-30835932.jpeg?auto=compress&cs=tinysrgb&w=800',NULL,39800,NULL,1,2,'大床',25,2,3,'[\"观景窗\",\"独立卫浴\",\"空调\"]',1),(2,'2026-09-10 17:36:29.894882','2026-09-10 17:36:29.894882','家庭套房','适合家庭入住','https://images.pexels.com/photos/34645062/pexels-photo-34645062.jpeg?auto=compress&cs=tinysrgb&w=800',NULL,59800,NULL,1,4,'大床+小床',40,2,2,'[\"观景窗\",\"独立卫浴\",\"客厅\",\"空调\"]',1),(3,'2026-09-10 17:36:29.900594','2026-09-10 17:36:29.900594','标准双人间','经济实惠之选','https://images.pexels.com/photos/29702285/pexels-photo-29702285.jpeg?auto=compress&cs=tinysrgb&w=800',NULL,29800,NULL,1,2,'双床',20,1,5,'[\"独立卫浴\",\"空调\"]',1),(4,'2026-09-10 17:36:29.906470','2026-09-10 17:36:29.906470','鼓楼景观房','可观鼓楼全景','https://images.pexels.com/photos/30835932/pexels-photo-30835932.jpeg?auto=compress&cs=tinysrgb&w=800',NULL,32800,NULL,2,2,'大床',22,2,4,'[\"鼓楼景观\",\"独立卫浴\"]',1),(5,'2026-09-10 17:36:29.913401','2026-09-10 17:36:29.913401','侗家特色房','体验侗族文化','https://images.pexels.com/photos/4577673/pexels-photo-4577673.jpeg?auto=compress&cs=tinysrgb&w=800',NULL,24800,NULL,2,2,'大床',20,1,6,'[\"侗族装饰\",\"独立卫浴\"]',1),(6,'2026-09-10 17:36:29.920612','2026-09-10 17:36:29.920612','三人间','朋友出行首选','https://images.pexels.com/photos/29702285/pexels-photo-29702285.jpeg?auto=compress&cs=tinysrgb&w=800',NULL,35800,NULL,2,3,'三床',28,1,3,'[\"独立卫浴\",\"阳台\"]',1),(7,'2026-09-10 17:36:29.927307','2026-09-10 17:36:29.927307','日出观景套房','最佳日出观赏点','https://images.pexels.com/photos/30835932/pexels-photo-30835932.jpeg?auto=compress&cs=tinysrgb&w=800',NULL,68800,NULL,3,2,'大床',35,3,2,'[\"超大观景台\",\"望远镜\",\"独立卫浴\",\"地暖\"]',1),(8,'2026-09-10 17:36:29.933418','2026-09-10 17:36:29.933418','云海景观房','云海奇观尽收眼底','https://images.pexels.com/photos/30835932/pexels-photo-30835932.jpeg?auto=compress&cs=tinysrgb&w=800',NULL,49800,NULL,3,2,'大床',28,2,3,'[\"观景窗\",\"咖啡机\",\"独立卫浴\"]',1),(9,'2026-09-10 17:36:29.940400','2026-09-10 17:36:29.940400','摄影主题房','专为摄影爱好者设计','https://images.pexels.com/photos/776120/pexels-photo-776120.jpeg?auto=compress&cs=tinysrgb&w=800',NULL,42800,NULL,3,2,'双床',25,2,2,'[\"摄影器材借用\",\"观景窗\",\"独立卫浴\"]',1),(10,'2026-09-10 17:36:29.947219','2026-09-10 17:36:29.947219','田园标准间','亲近自然的体验','https://images.pexels.com/photos/13872620/pexels-photo-13872620.jpeg?auto=compress&cs=tinysrgb&w=800',NULL,19800,NULL,4,2,'双床',18,1,8,'[\"田园景观\",\"独立卫浴\"]',1),(11,'2026-09-10 17:36:29.952721','2026-09-10 17:36:29.952721','亲子家庭房','带孩子体验农耕','https://images.pexels.com/photos/34645062/pexels-photo-34645062.jpeg?auto=compress&cs=tinysrgb&w=800',NULL,28800,NULL,4,3,'大床+小床',30,1,4,'[\"儿童床\",\"玩具\",\"独立卫浴\"]',1),(12,'2026-09-10 17:36:29.958046','2026-09-10 17:36:29.958046','阳光大床房','阳光充沛的温馨房间','https://images.pexels.com/photos/776120/pexels-photo-776120.jpeg?auto=compress&cs=tinysrgb&w=800',NULL,21800,NULL,4,2,'大床',20,2,5,'[\"阳光充足\",\"独立卫浴\",\"阳台\"]',1);
/*!40000 ALTER TABLE `app_room` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_route`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_route` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '路线名称',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '路线描述',
  `coverImage` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '封面图',
  `routeType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '路线类型 如:一日游/两日游/深度游',
  `price` int NOT NULL DEFAULT '0' COMMENT '价格(分)',
  `originalPrice` int DEFAULT NULL COMMENT '原价(分)',
  `scenicId` int DEFAULT NULL COMMENT '所属景区ID',
  `spots` text COLLATE utf8mb4_unicode_ci COMMENT '途经景点(JSON)',
  `itinerary` text COLLATE utf8mb4_unicode_ci COMMENT '行程安排(JSON)',
  `includes` text COLLATE utf8mb4_unicode_ci COMMENT '包含服务(JSON)',
  `tips` text COLLATE utf8mb4_unicode_ci COMMENT '注意事项',
  `meetingPoint` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '集合地点',
  `meetingTime` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '集合时间',
  `minPeople` int NOT NULL DEFAULT '10' COMMENT '成团人数',
  `maxPeople` int NOT NULL DEFAULT '30' COMMENT '最大人数',
  `enrolledCount` int NOT NULL DEFAULT '0' COMMENT '已报名人数',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态 0-不可预订 1-可预订',
  `isRecommend` int NOT NULL DEFAULT '0' COMMENT '是否推荐 0-否 1-是',
  PRIMARY KEY (`id`),
  KEY `IDX_2036309e8c392fcc49b71d000e` (`createTime`),
  KEY `IDX_752bc620dfd82d9a399b626436` (`updateTime`),
  KEY `IDX_874daa969f494eda975af4c457` (`name`),
  KEY `IDX_0a4ba7f219cc55dc26c5a2234c` (`scenicId`),
  CONSTRAINT `FK_0a4ba7f219cc55dc26c5a2234c4` FOREIGN KEY (`scenicId`) REFERENCES `app_scenic` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_route` WRITE;
/*!40000 ALTER TABLE `app_route` DISABLE KEYS */;
INSERT INTO `app_route` VALUES (1,'2026-09-10 17:36:32.809413','2026-09-10 17:36:32.809413','乌东梯田日出游','清晨登山观赏梯田日出，体验云海翻涌的壮观景象，留下最美的旅行记忆','https://images.pexels.com/photos/14036107/pexels-photo-14036107.jpeg?auto=compress&cs=tinysrgb&w=800','半日游',19800,NULL,1,'[\"观景台\",\"摄影点\",\"苗寨\"]','[{\"time\":\"05:30\",\"activity\":\"酒店出发，前往观景台\"},{\"time\":\"06:00\",\"activity\":\"抵达观景台，等待日出\"},{\"time\":\"06:30-07:30\",\"activity\":\"观赏梯田日出云海，摄影\"},{\"time\":\"08:00\",\"activity\":\"下山，途经苗寨\"},{\"time\":\"09:00\",\"activity\":\"返回乌东村或用早餐\"}]','[\"导游\",\"早餐\",\"摄影指导\"]','建议穿运动鞋，带外套，早晨较凉','乌东村文化广场','05:30',5,15,0,1,1),(2,'2026-09-10 17:36:32.817404','2026-09-10 17:36:32.817404','苗族文化深度体验一日游','深入了解苗族文化，参观博物馆，体验蜡染、刺绣等非遗项目','https://images.pexels.com/photos/8776825/pexels-photo-8776825.jpeg?auto=compress&cs=tinysrgb&w=800','一日游',39800,NULL,2,'[\"苗族博物馆\",\"蜡染体验坊\",\"银饰工坊\",\"苗家午餐\"]','[{\"time\":\"09:00\",\"activity\":\"乌东村集合，参观苗族博物馆\"},{\"time\":\"10:30\",\"activity\":\"前往蜡染体验坊，学习蜡染技艺\"},{\"time\":\"12:00\",\"activity\":\"苗家特色午餐\"},{\"time\":\"13:30\",\"activity\":\"参观银饰工坊，了解银饰制作\"},{\"time\":\"15:00\",\"activity\":\"自由活动/购物\"},{\"time\":\"17:00\",\"activity\":\"返回\"}]','[\"全程导游\",\"午餐\",\"蜡染体验\",\"银饰工坊参观\"]','可购买自制蜡染作品带走，需提前预约','乌东村文化广场','09:00',8,25,0,1,1),(3,'2026-09-10 17:36:32.823622','2026-09-10 17:36:32.823622','古寨探秘两日游','两天时间深度游览乌东古寨，体验原生态苗寨生活，感受千年民族文化','https://images.pexels.com/photos/15255679/pexels-photo-15255679.jpeg?auto=compress&cs=tinysrgb&w=800','两日游',79800,NULL,3,'[\"古寨游览\",\"吊脚楼\",\"农田体验\",\"篝火晚会\"]','[{\"day\":1,\"content\":[{\"time\":\"10:00\",\"activity\":\"抵达乌东村，入住民宿\"},{\"time\":\"11:00\",\"activity\":\"古寨深度游览\"},{\"time\":\"12:30\",\"activity\":\"苗家午餐\"},{\"time\":\"14:00\",\"activity\":\"农田体验/农耕活动\"},{\"time\":\"18:00\",\"activity\":\"苗家晚餐\"},{\"time\":\"19:30\",\"activity\":\"篝火晚会/歌舞表演\"},{\"time\":\"21:30\",\"activity\":\"住宿休息\"}]},{\"day\":2,\"content\":[{\"time\":\"07:00\",\"activity\":\"早餐\"},{\"time\":\"08:00\",\"activity\":\"梯田日出观光\"},{\"time\":\"10:00\",\"activity\":\"自由活动/购物\"},{\"time\":\"12:00\",\"activity\":\"告别午餐\"},{\"time\":\"14:00\",\"activity\":\"返程\"}]}]','[\"1晚住宿\",\"3正1早\",\"篝火晚会\",\"导游服务\",\"农田体验\"]','住宿为当地民宿，体验原汁原味的苗寨生活','从江高铁站/黎平机场','10:00',6,20,0,1,1),(4,'2026-09-10 17:36:32.830498','2026-09-10 17:36:32.830498','侗苗文化双体验周末游','周末两日，兼具体验苗族和侗族两种民族文化，收获双倍的文化体验','https://images.pexels.com/photos/7494233/pexels-photo-7494233.jpeg?auto=compress&cs=tinysrgb&w=800','两日游',69800,NULL,4,'[\"侗族鼓楼\",\"苗族博物馆\",\"蜡染体验\",\"侗族大歌\"]','[{\"day\":1,\"content\":[{\"time\":\"10:00\",\"activity\":\"抵达乌东村\"},{\"time\":\"11:00\",\"activity\":\"参观侗族鼓楼\"},{\"time\":\"12:30\",\"activity\":\"侗家午餐\"},{\"time\":\"14:00\",\"activity\":\"苗族博物馆深度参观\"},{\"time\":\"16:00\",\"activity\":\"蜡染体验\"},{\"time\":\"18:30\",\"activity\":\"苗家晚餐\"},{\"time\":\"20:00\",\"activity\":\"侗族大歌表演\"}]},{\"day\":2,\"content\":[{\"time\":\"08:00\",\"activity\":\"早餐\"},{\"time\":\"09:00\",\"activity\":\"梯田日出/古寨游览\"},{\"time\":\"12:00\",\"activity\":\"告别午餐\"},{\"time\":\"14:00\",\"activity\":\"返程\"}]}]','[\"1晚住宿\",\"3正1早\",\"蜡染体验\",\"侗族大歌\"]','周末团期固定，请提前预约','从江高铁站','10:00',10,30,0,1,1);
/*!40000 ALTER TABLE `app_route` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_scenic`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_scenic` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '景区名称',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '景区描述',
  `coverImage` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '封面图',
  `images` text COLLATE utf8mb4_unicode_ci COMMENT '图片(JSON)',
  `address` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '地址',
  `longitude` decimal(10,6) DEFAULT NULL COMMENT '经度',
  `latitude` decimal(10,6) DEFAULT NULL COMMENT '纬度',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系电话',
  `openTime` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '开放时间',
  `suggestedDuration` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '建议游玩时长',
  `scenicType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '景区类型 如:自然风光/民族文化/历史遗迹',
  `tags` text COLLATE utf8mb4_unicode_ci COMMENT '特色标签(JSON)',
  `ticketPrice` int DEFAULT NULL COMMENT '门票价格(分)',
  `favoriteCount` int NOT NULL DEFAULT '0' COMMENT '收藏数量',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态 0-关闭 1-开放',
  `isRecommend` int NOT NULL DEFAULT '0' COMMENT '是否推荐 0-否 1-是',
  PRIMARY KEY (`id`),
  KEY `IDX_e52faf90398c91683067163db5` (`createTime`),
  KEY `IDX_519c06793da3a7d8feec62c310` (`updateTime`),
  KEY `IDX_75ff369c142b641024993c1cab` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_scenic` WRITE;
/*!40000 ALTER TABLE `app_scenic` DISABLE KEYS */;
INSERT INTO `app_scenic` VALUES (1,'2026-09-10 17:36:32.768976','2026-09-10 17:36:32.768976','乌东梯田','层层叠叠的苗族梯田，四季变换不同美景，被誉为\"挂在山间的天梯\"，是摄影爱好者的天堂','https://images.pexels.com/photos/7206100/pexels-photo-7206100.png?auto=compress&cs=tinysrgb&w=800','[\"https://images.pexels.com/photos/7206100/pexels-photo-7206100.png?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/36810327/pexels-photo-36810327.jpeg?auto=compress&cs=tinysrgb&w=800\"]','乌东村',108.683500,26.488500,'0855-8234001','全天开放','2-4小时','自然风光','[\"梯田\",\"摄影\",\"日出\"]',0,0,1,1),(2,'2026-09-10 17:36:32.780778','2026-09-10 17:36:32.780778','苗族博物馆','展示苗族历史文化、服饰银饰、农耕文明的专题博物馆，了解苗族文化的窗口','https://images.pexels.com/photos/30311888/pexels-photo-30311888.jpeg?auto=compress&cs=tinysrgb&w=800','[\"https://images.pexels.com/photos/30311888/pexels-photo-30311888.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/20610602/pexels-photo-20610602.jpeg?auto=compress&cs=tinysrgb&w=800\"]','乌东村一组',108.684500,26.487500,'0855-8234002','08:30-17:30','1-2小时','民族文化','[\"苗族文化\",\"博物馆\",\"非遗\"]',0,0,1,1),(3,'2026-09-10 17:36:32.788873','2026-09-10 17:36:32.788873','乌东古寨','百年历史的苗族古寨，保存完好的吊脚楼建筑群，是活着的苗族历史博物馆','https://images.pexels.com/photos/36267610/pexels-photo-36267610.jpeg?auto=compress&cs=tinysrgb&w=800','[\"https://images.pexels.com/photos/36267610/pexels-photo-36267610.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/10221253/pexels-photo-10221253.jpeg?auto=compress&cs=tinysrgb&w=800\"]','乌东村古寨区',108.685500,26.489500,'0855-8234003','全天开放','2-3小时','历史遗迹','[\"古建筑\",\"吊脚楼\",\"民俗\"]',0,0,1,1),(4,'2026-09-10 17:36:32.795999','2026-09-10 17:36:32.795999','侗族鼓楼','侗族标志性建筑，节日集会的重要场所，展现侗族人民的建筑智慧','https://images.pexels.com/photos/12357815/pexels-photo-12357815.jpeg?auto=compress&cs=tinysrgb&w=800','[\"https://images.pexels.com/photos/12357815/pexels-photo-12357815.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/37705849/pexels-photo-37705849.jpeg?auto=compress&cs=tinysrgb&w=800\"]','乌东村二组',108.686500,26.490500,'0855-8234004','全天开放','1小时','民族文化','[\"侗族文化\",\"鼓楼\",\"非遗\"]',0,0,1,0),(5,'2026-09-10 17:36:32.802419','2026-09-10 17:36:32.802419','苗族歌舞表演','每晚举行的苗族歌舞表演，体验苗族人民的热情，感受原生态民族艺术魅力','https://images.pexels.com/photos/13460125/pexels-photo-13460125.jpeg?auto=compress&cs=tinysrgb&w=800','[\"https://images.pexels.com/photos/13460125/pexels-photo-13460125.jpeg?auto=compress&cs=tinysrgb&w=800\",\"https://images.pexels.com/photos/3996466/pexels-photo-3996466.jpeg?auto=compress&cs=tinysrgb&w=800\"]','乌东村民族文化广场',108.684800,26.488800,'0855-8234005','19:30-21:00','1.5小时','民族文化','[\"歌舞表演\",\"篝火晚会\",\"互动体验\"]',5000,0,1,1);
/*!40000 ALTER TABLE `app_scenic` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_table` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `tableNo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '餐桌编号',
  `tableType` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '中桌' COMMENT '餐桌类型 如:大桌/中桌/小桌/包间',
  `capacity` int NOT NULL DEFAULT '4' COMMENT '容纳人数',
  `price` int NOT NULL DEFAULT '0' COMMENT '价格(分)',
  `restaurantId` int NOT NULL COMMENT '餐厅ID',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态 0-不可用 1-可用',
  PRIMARY KEY (`id`),
  KEY `IDX_b2acaf8beed7133527d0870313` (`createTime`),
  KEY `IDX_4539085687429fd4f71820dbca` (`updateTime`),
  KEY `IDX_15ff7e80e39c11b0c15f291c07` (`tableNo`),
  KEY `IDX_364e40a800486b4fa66ae06d85` (`restaurantId`),
  CONSTRAINT `FK_364e40a800486b4fa66ae06d858` FOREIGN KEY (`restaurantId`) REFERENCES `app_restaurant` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_table` WRITE;
/*!40000 ALTER TABLE `app_table` DISABLE KEYS */;
INSERT INTO `app_table` VALUES (1,'2026-09-10 17:36:26.883615','2026-09-10 17:36:26.883615','A01','包间',10,5000,1,1),(2,'2026-09-10 17:36:26.890959','2026-09-10 17:36:26.890959','A02','包间',8,3000,1,1),(3,'2026-09-10 17:36:26.896902','2026-09-10 17:36:26.896902','B01','大桌',6,0,1,1),(4,'2026-09-10 17:36:26.903212','2026-09-10 17:36:26.903212','B02','大桌',6,0,1,1),(5,'2026-09-10 17:36:26.908892','2026-09-10 17:36:26.908892','C01','中桌',4,0,1,1),(6,'2026-09-10 17:36:26.913817','2026-09-10 17:36:26.913817','C02','中桌',4,0,1,1),(7,'2026-09-10 17:36:26.919536','2026-09-10 17:36:26.919536','C03','中桌',4,0,1,1),(8,'2026-09-10 17:36:26.924649','2026-09-10 17:36:26.924649','D01','小桌',2,0,1,1),(9,'2026-09-10 17:36:26.929131','2026-09-10 17:36:26.929131','A01','包间',10,5000,2,1),(10,'2026-09-10 17:36:26.934940','2026-09-10 17:36:26.934940','A02','包间',8,3000,2,1),(11,'2026-09-10 17:36:26.939766','2026-09-10 17:36:26.939766','B01','大桌',6,0,2,1),(12,'2026-09-10 17:36:26.944343','2026-09-10 17:36:26.944343','B02','大桌',6,0,2,1),(13,'2026-09-10 17:36:26.949927','2026-09-10 17:36:26.949927','C01','中桌',4,0,2,1),(14,'2026-09-10 17:36:26.954870','2026-09-10 17:36:26.954870','C02','中桌',4,0,2,1),(15,'2026-09-10 17:36:26.959769','2026-09-10 17:36:26.959769','C03','中桌',4,0,2,1),(16,'2026-09-10 17:36:26.965466','2026-09-10 17:36:26.965466','D01','小桌',2,0,2,1),(17,'2026-09-10 17:36:26.970922','2026-09-10 17:36:26.970922','A01','包间',10,5000,3,1),(18,'2026-09-10 17:36:26.976106','2026-09-10 17:36:26.976106','A02','包间',8,3000,3,1),(19,'2026-09-10 17:36:26.981136','2026-09-10 17:36:26.981136','B01','大桌',6,0,3,1),(20,'2026-09-10 17:36:26.985417','2026-09-10 17:36:26.985417','B02','大桌',6,0,3,1),(21,'2026-09-10 17:36:26.990006','2026-09-10 17:36:26.990006','C01','中桌',4,0,3,1),(22,'2026-09-10 17:36:26.995060','2026-09-10 17:36:26.995060','C02','中桌',4,0,3,1),(23,'2026-09-10 17:36:26.999702','2026-09-10 17:36:26.999702','C03','中桌',4,0,3,1),(24,'2026-09-10 17:36:27.004569','2026-09-10 17:36:27.004569','D01','小桌',2,0,3,1),(25,'2026-09-10 17:36:27.009342','2026-09-10 17:36:27.009342','A01','包间',10,5000,4,1),(26,'2026-09-10 17:36:27.013911','2026-09-10 17:36:27.013911','A02','包间',8,3000,4,1),(27,'2026-09-10 17:36:27.018863','2026-09-10 17:36:27.018863','B01','大桌',6,0,4,1),(28,'2026-09-10 17:36:27.024588','2026-09-10 17:36:27.024588','B02','大桌',6,0,4,1),(29,'2026-09-10 17:36:27.030202','2026-09-10 17:36:27.030202','C01','中桌',4,0,4,1),(30,'2026-09-10 17:36:27.035478','2026-09-10 17:36:27.035478','C02','中桌',4,0,4,1),(31,'2026-09-10 17:36:27.041093','2026-09-10 17:36:27.041093','C03','中桌',4,0,4,1),(32,'2026-09-10 17:36:27.046668','2026-09-10 17:36:27.046668','D01','小桌',2,0,4,1);
/*!40000 ALTER TABLE `app_table` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `app_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_user` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '手机号',
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `nickname` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '头像',
  `gender` int NOT NULL DEFAULT '0' COMMENT '性别 0-未知 1-男 2-女',
  `region` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '地区',
  `bio` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '个人简介',
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'visitor' COMMENT '角色 visitor-游客 merchant-商家',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态 0-禁用 1-启用',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_6a952ce9581e4c18e08d1f5213` (`phone`),
  KEY `IDX_5c6fde5086d4877a22f461b3b2` (`createTime`),
  KEY `IDX_26a33fc09b587089f836bc4116` (`updateTime`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `app_user` WRITE;
/*!40000 ALTER TABLE `app_user` DISABLE KEYS */;
INSERT INTO `app_user` VALUES (1,'2026-09-10 17:36:20.764489','2026-09-10 17:36:20.764489','13800138000','$2a$10$az7OZXtgtNVLDC9y2FcIjOHbAfVeRTZDpKht9ZwCyJESAEqk4IbW6','乌东文旅小管家','https://images.pexels.com/photos/7400017/pexels-photo-7400017.jpeg?auto=compress&cs=tinysrgb&w=800',0,NULL,NULL,'admin',1),(2,'2026-09-10 17:36:20.776680','2026-09-10 17:36:20.776680','13800138001','$2a$10$az7OZXtgtNVLDC9y2FcIjOHbAfVeRTZDpKht9ZwCyJESAEqk4IbW6','小满爱旅行','https://images.pexels.com/photos/9963637/pexels-photo-9963637.jpeg?auto=compress&cs=tinysrgb&w=800',0,NULL,NULL,'visitor',1),(3,'2026-09-10 17:36:20.783656','2026-09-10 17:36:20.783656','13800138002','$2a$10$az7OZXtgtNVLDC9y2FcIjOHbAfVeRTZDpKht9ZwCyJESAEqk4IbW6','苗族姑娘阿朵','https://images.pexels.com/photos/6605133/pexels-photo-6605133.jpeg?auto=compress&cs=tinysrgb&w=800',0,NULL,NULL,'visitor',1),(4,'2026-09-10 17:36:20.789385','2026-09-10 17:36:20.789385','13900139001','$2a$10$az7OZXtgtNVLDC9y2FcIjOHbAfVeRTZDpKht9ZwCyJESAEqk4IbW6','银饰匠人老吴','https://images.pexels.com/photos/11482126/pexels-photo-11482126.jpeg?auto=compress&cs=tinysrgb&w=800',0,NULL,NULL,'merchant',1),(5,'2026-09-10 17:36:20.794804','2026-09-10 17:36:20.794804','13900139002','$2a$10$az7OZXtgtNVLDC9y2FcIjOHbAfVeRTZDpKht9ZwCyJESAEqk4IbW6','半山民宿老杨','https://images.pexels.com/photos/3290499/pexels-photo-3290499.jpeg?auto=compress&cs=tinysrgb&w=800',0,NULL,NULL,'merchant',1),(6,'2026-09-10 17:36:20.800311','2026-09-10 17:36:20.800311','13800138003','$2a$10$az7OZXtgtNVLDC9y2FcIjOHbAfVeRTZDpKht9ZwCyJESAEqk4IbW6','追光者阿远','https://images.pexels.com/photos/1191488/pexels-photo-1191488.jpeg?auto=compress&cs=tinysrgb&w=800',0,NULL,NULL,'visitor',1),(7,'2026-09-10 17:36:20.805635','2026-09-10 17:36:20.805635','13800138004','$2a$10$az7OZXtgtNVLDC9y2FcIjOHbAfVeRTZDpKht9ZwCyJESAEqk4IbW6','山野食客','https://images.pexels.com/photos/907862/pexels-photo-907862.jpeg?auto=compress&cs=tinysrgb&w=800',0,NULL,NULL,'visitor',1),(8,'2026-09-10 17:36:20.811697','2026-09-10 17:36:20.811697','13800138005','$2a$10$az7OZXtgtNVLDC9y2FcIjOHbAfVeRTZDpKht9ZwCyJESAEqk4IbW6','背包客小舟','https://images.pexels.com/photos/6137038/pexels-photo-6137038.jpeg?auto=compress&cs=tinysrgb&w=800',0,NULL,NULL,'visitor',1);
/*!40000 ALTER TABLE `app_user` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `userId` int NOT NULL COMMENT '用户ID',
  `productId` int NOT NULL COMMENT '商品ID',
  `quantity` int NOT NULL DEFAULT '1' COMMENT '数量',
  `selected` int NOT NULL DEFAULT '1' COMMENT '是否选中 0-否 1-是',
  PRIMARY KEY (`id`),
  KEY `IDX_52873a7f7f6d060d4f24d4fcb3` (`createTime`),
  KEY `IDX_296a70648b8c86e9b050675287` (`updateTime`),
  KEY `IDX_756f53ab9466eb52a52619ee01` (`userId`),
  KEY `IDX_371eb56ecc4104c2644711fa85` (`productId`),
  CONSTRAINT `FK_371eb56ecc4104c2644711fa85f` FOREIGN KEY (`productId`) REFERENCES `app_product` (`id`),
  CONSTRAINT `FK_756f53ab9466eb52a52619ee019` FOREIGN KEY (`userId`) REFERENCES `app_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

