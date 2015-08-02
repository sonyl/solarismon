CREATE TABLE `data` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `entry_ts` datetime NOT NULL COMMENT 'When the dataset was created',
  `collector_tmp` int(11) DEFAULT NULL COMMENT 'TK [C]',
  `backward_flow_tmp` int(11) DEFAULT NULL COMMENT 'TR [C]',
  `storage_tmp` int(11) DEFAULT NULL COMMENT 'TS [C]',
  `forward_flow_tmp` int(11) DEFAULT NULL COMMENT 'TV [C]',
  `flow` decimal(4,1) DEFAULT NULL COMMENT 'V [l/min]',
  `status` varchar(10) DEFAULT NULL COMMENT 'the status',
  `power` int(11) DEFAULT NULL COMMENT 'Power [W]',
  `pump1` int(3) DEFAULT NULL COMMENT 'Pump 1 [%]',
  `pump2` BOOLEAN DEFAULT NULL COMMENT 'Pump 2 On/Off',
  PRIMARY KEY (`id`),
  KEY `timeIDX` (`entry_ts`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
