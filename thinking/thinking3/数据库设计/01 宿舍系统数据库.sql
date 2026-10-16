-- Dormitory management system logical database schema.
-- Target: MySQL 8.0.16+ / InnoDB / utf8mb4.
-- Run through a versioned migration tool in production; this file is the initial schema baseline.
CREATE DATABASE IF NOT EXISTS dorm_management
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE dorm_management;

SET NAMES utf8mb4;
SET time_zone = '+08:00';

-- 1. Accounts, roles, permissions, and role profiles
CREATE TABLE sys_user (
    user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'User account primary key',
    login_account VARCHAR(100) NOT NULL COMMENT 'Unique login account',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Password hash, never plaintext',
    real_name VARCHAR(100) NOT NULL COMMENT 'User display name',
    phone VARCHAR(32) NULL COMMENT 'Contact phone',
    email VARCHAR(254) NULL COMMENT 'Email address',
    gender VARCHAR(20) NULL COMMENT 'Gender, optional basic profile fact',
    enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Whether login is enabled',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (user_id),
    UNIQUE KEY uq_sys_user_login_account (login_account),
    KEY idx_sys_user_real_name (real_name),
    CONSTRAINT chk_sys_user_enabled CHECK (enabled IN (0, 1))
) ENGINE=InnoDB COMMENT='Shared user accounts for all four roles';

CREATE TABLE role (
    role_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    role_code VARCHAR(40) NOT NULL COMMENT 'STUDENT, DORM_MANAGER, REPAIRER, ADMIN',
    role_name VARCHAR(80) NOT NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    description VARCHAR(500) NULL,
    PRIMARY KEY (role_id),
    UNIQUE KEY uq_role_code (role_code),
    CONSTRAINT chk_role_enabled CHECK (enabled IN (0, 1))
) ENGINE=InnoDB COMMENT='Role dictionary';

CREATE TABLE permission (
    permission_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    permission_code VARCHAR(100) NOT NULL,
    permission_name VARCHAR(120) NOT NULL,
    permission_type VARCHAR(30) NOT NULL COMMENT 'MENU or ACTION',
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (permission_id),
    UNIQUE KEY uq_permission_code (permission_code),
    KEY idx_permission_type (permission_type),
    CONSTRAINT chk_permission_enabled CHECK (enabled IN (0, 1))
) ENGINE=InnoDB COMMENT='Functional permission dictionary';

CREATE TABLE user_role (
    user_role_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    valid_from DATETIME(3) NOT NULL,
    valid_to DATETIME(3) NULL,
    granted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (user_role_id),
    UNIQUE KEY uq_user_role_start (user_id, role_id, valid_from),
    KEY idx_user_role_role_validity (role_id, valid_from, valid_to),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES sys_user (user_id),
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES role (role_id),
    CONSTRAINT chk_user_role_period CHECK (valid_to IS NULL OR valid_to > valid_from)
) ENGINE=InnoDB COMMENT='User-to-role grant history';

CREATE TABLE role_permission (
    role_id BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    granted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permission_role FOREIGN KEY (role_id) REFERENCES role (role_id),
    CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission_id) REFERENCES permission (permission_id)
) ENGINE=InnoDB COMMENT='Role-to-permission relation';

-- 2. Academic structure, a normalization support domain only
CREATE TABLE department (
    department_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    department_code VARCHAR(40) NOT NULL,
    department_name VARCHAR(160) NOT NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (department_id),
    UNIQUE KEY uq_department_code (department_code),
    CONSTRAINT chk_department_enabled CHECK (enabled IN (0, 1))
) ENGINE=InnoDB COMMENT='Academic department basic data';

CREATE TABLE major (
    major_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    department_id BIGINT UNSIGNED NOT NULL,
    major_code VARCHAR(40) NOT NULL,
    major_name VARCHAR(160) NOT NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (major_id),
    UNIQUE KEY uq_major_code (major_code),
    KEY idx_major_department (department_id),
    CONSTRAINT fk_major_department FOREIGN KEY (department_id) REFERENCES department (department_id),
    CONSTRAINT chk_major_enabled CHECK (enabled IN (0, 1))
) ENGINE=InnoDB COMMENT='Major belongs to one department';

CREATE TABLE student_class (
    class_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    major_id BIGINT UNSIGNED NOT NULL,
    class_code VARCHAR(60) NOT NULL,
    class_name VARCHAR(160) NOT NULL,
    enrollment_year SMALLINT UNSIGNED NULL COMMENT 'Cohort year of the class',
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (class_id),
    UNIQUE KEY uq_student_class_code (class_code),
    KEY idx_student_class_major (major_id),
    CONSTRAINT fk_student_class_major FOREIGN KEY (major_id) REFERENCES major (major_id),
    CONSTRAINT chk_student_class_enabled CHECK (enabled IN (0, 1)),
    CONSTRAINT chk_student_class_year CHECK (enrollment_year IS NULL OR enrollment_year BETWEEN 1900 AND 2200)
) ENGINE=InnoDB COMMENT='Class basic data';

CREATE TABLE student_profile (
    student_profile_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    student_no VARCHAR(40) NOT NULL,
    class_id BIGINT UNSIGNED NULL,
    enrollment_status VARCHAR(30) NOT NULL COMMENT 'ENROLLED, SUSPENDED, GRADUATED, etc.',
    PRIMARY KEY (student_profile_id),
    UNIQUE KEY uq_student_profile_user (user_id),
    UNIQUE KEY uq_student_no (student_no),
    KEY idx_student_profile_class (class_id),
    CONSTRAINT fk_student_profile_user FOREIGN KEY (user_id) REFERENCES sys_user (user_id),
    CONSTRAINT fk_student_profile_class FOREIGN KEY (class_id) REFERENCES student_class (class_id)
) ENGINE=InnoDB COMMENT='Student-specific facts; names and contact live in sys_user';

CREATE TABLE dorm_manager_profile (
    manager_profile_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    employee_no VARCHAR(40) NOT NULL,
    on_duty TINYINT(1) NOT NULL DEFAULT 1,
    remark VARCHAR(500) NULL,
    PRIMARY KEY (manager_profile_id),
    UNIQUE KEY uq_manager_user (user_id),
    UNIQUE KEY uq_manager_employee_no (employee_no),
    CONSTRAINT fk_manager_user FOREIGN KEY (user_id) REFERENCES sys_user (user_id),
    CONSTRAINT chk_manager_on_duty CHECK (on_duty IN (0, 1))
) ENGINE=InnoDB COMMENT='Dorm manager-specific facts';

CREATE TABLE repairer_profile (
    repairer_profile_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    employee_no VARCHAR(40) NOT NULL,
    on_duty TINYINT(1) NOT NULL DEFAULT 1,
    max_active_orders INT UNSIGNED NULL COMMENT 'NULL means no configured cap',
    profile_note VARCHAR(500) NULL,
    PRIMARY KEY (repairer_profile_id),
    UNIQUE KEY uq_repairer_user (user_id),
    UNIQUE KEY uq_repairer_employee_no (employee_no),
    CONSTRAINT fk_repairer_user FOREIGN KEY (user_id) REFERENCES sys_user (user_id),
    CONSTRAINT chk_repairer_on_duty CHECK (on_duty IN (0, 1))
) ENGINE=InnoDB COMMENT='Repair worker-specific facts';

-- 3. Dormitory inventory and dated assignments
CREATE TABLE building (
    building_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    building_code VARCHAR(40) NOT NULL,
    building_name VARCHAR(120) NOT NULL,
    address VARCHAR(300) NOT NULL,
    gender_limit VARCHAR(30) NOT NULL,
    usage_status VARCHAR(30) NOT NULL,
    description VARCHAR(1000) NULL,
    PRIMARY KEY (building_id),
    UNIQUE KEY uq_building_code (building_code),
    KEY idx_building_status (usage_status)
) ENGINE=InnoDB COMMENT='Dormitory building';

CREATE TABLE dorm_room (
    room_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    building_id BIGINT UNSIGNED NOT NULL,
    room_no VARCHAR(40) NOT NULL,
    floor_no SMALLINT NOT NULL,
    design_capacity SMALLINT UNSIGNED NOT NULL,
    usage_status VARCHAR(30) NOT NULL,
    description VARCHAR(1000) NULL,
    PRIMARY KEY (room_id),
    UNIQUE KEY uq_room_building_room_no (building_id, room_no),
    KEY idx_room_building_status (building_id, usage_status),
    CONSTRAINT fk_room_building FOREIGN KEY (building_id) REFERENCES building (building_id),
    CONSTRAINT chk_room_capacity CHECK (design_capacity > 0)
) ENGINE=InnoDB COMMENT='Room belongs to one building';

CREATE TABLE bed (
    bed_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    room_id BIGINT UNSIGNED NOT NULL,
    bed_no VARCHAR(40) NOT NULL,
    management_status VARCHAR(30) NOT NULL COMMENT 'AVAILABLE, MAINTENANCE, DISABLED; occupancy is derived',
    description VARCHAR(500) NULL,
    PRIMARY KEY (bed_id),
    UNIQUE KEY uq_bed_room_bed_no (room_id, bed_no),
    KEY idx_bed_room_status (room_id, management_status),
    CONSTRAINT fk_bed_room FOREIGN KEY (room_id) REFERENCES dorm_room (room_id)
) ENGINE=InnoDB COMMENT='Bed inventory; no duplicated occupied flag';

CREATE TABLE dorm_manager_building_scope (
    scope_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    manager_profile_id BIGINT UNSIGNED NOT NULL,
    building_id BIGINT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    PRIMARY KEY (scope_id),
    UNIQUE KEY uq_manager_building_start (manager_profile_id, building_id, start_date),
    KEY idx_manager_scope_building_period (building_id, start_date, end_date),
    CONSTRAINT fk_manager_scope_profile FOREIGN KEY (manager_profile_id) REFERENCES dorm_manager_profile (manager_profile_id),
    CONSTRAINT fk_manager_scope_building FOREIGN KEY (building_id) REFERENCES building (building_id),
    CONSTRAINT chk_manager_scope_period CHECK (end_date IS NULL OR end_date > start_date)
) ENGINE=InnoDB COMMENT='Historical manager-to-building responsibility';

CREATE TABLE accommodation_assignment (
    assignment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    student_profile_id BIGINT UNSIGNED NOT NULL,
    bed_id BIGINT UNSIGNED NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NULL COMMENT 'Exclusive upper bound; NULL means no end date',
    assignment_type VARCHAR(30) NOT NULL COMMENT 'INITIAL or TRANSFER',
    adjustment_reason VARCHAR(1000) NULL,
    assigned_by_user_id BIGINT UNSIGNED NOT NULL,
    recorded_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    terminated_by_user_id BIGINT UNSIGNED NULL,
    cancelled_by_user_id BIGINT UNSIGNED NULL,
    cancelled_at DATETIME(3) NULL,
    PRIMARY KEY (assignment_id),
    KEY idx_assignment_student_period (student_profile_id, check_in_date, check_out_date),
    KEY idx_assignment_bed_period (bed_id, check_in_date, check_out_date),
    KEY idx_assignment_cancelled_at (cancelled_at),
    CONSTRAINT fk_assignment_student FOREIGN KEY (student_profile_id) REFERENCES student_profile (student_profile_id),
    CONSTRAINT fk_assignment_bed FOREIGN KEY (bed_id) REFERENCES bed (bed_id),
    CONSTRAINT fk_assignment_assigned_by FOREIGN KEY (assigned_by_user_id) REFERENCES sys_user (user_id),
    CONSTRAINT fk_assignment_terminated_by FOREIGN KEY (terminated_by_user_id) REFERENCES sys_user (user_id),
    CONSTRAINT fk_assignment_cancelled_by FOREIGN KEY (cancelled_by_user_id) REFERENCES sys_user (user_id),
    CONSTRAINT chk_assignment_period CHECK (check_out_date IS NULL OR check_out_date > check_in_date),
    CONSTRAINT chk_assignment_cancel CHECK ((cancelled_at IS NULL AND cancelled_by_user_id IS NULL) OR (cancelled_at IS NOT NULL AND cancelled_by_user_id IS NOT NULL))
) ENGINE=InnoDB COMMENT='Historical student-to-bed assignment; enforce interval exclusion transactionally';

-- 4. Repair dictionaries and worker scopes
CREATE TABLE fault_category (
    category_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    category_code VARCHAR(50) NOT NULL,
    category_name VARCHAR(120) NOT NULL,
    in_campus_scope TINYINT(1) NOT NULL DEFAULT 1,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    description VARCHAR(1000) NULL,
    PRIMARY KEY (category_id),
    UNIQUE KEY uq_fault_category_code (category_code),
    KEY idx_fault_category_enabled (enabled, in_campus_scope),
    CONSTRAINT chk_fault_category_flags CHECK (in_campus_scope IN (0, 1) AND enabled IN (0, 1))
) ENGINE=InnoDB COMMENT='Fault categories';

CREATE TABLE repair_work_type (
    work_type_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    work_type_code VARCHAR(50) NOT NULL,
    work_type_name VARCHAR(120) NOT NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    description VARCHAR(1000) NULL,
    PRIMARY KEY (work_type_id),
    UNIQUE KEY uq_repair_work_type_code (work_type_code),
    CONSTRAINT chk_repair_work_type_enabled CHECK (enabled IN (0, 1))
) ENGINE=InnoDB COMMENT='Repair trade dictionary';

CREATE TABLE repair_rule (
    rule_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    rule_code VARCHAR(80) NOT NULL,
    version_no INT UNSIGNED NOT NULL,
    rule_name VARCHAR(120) NOT NULL,
    accept_timeout_minutes INT UNSIGNED NOT NULL DEFAULT 120,
    normal_repair_minutes INT UNSIGNED NOT NULL DEFAULT 1440,
    urgent_repair_minutes INT UNSIGNED NOT NULL DEFAULT 360,
    confirm_timeout_days SMALLINT UNSIGNED NOT NULL DEFAULT 7,
    pending_edit_close_days SMALLINT UNSIGNED NOT NULL DEFAULT 7,
    max_rework_count SMALLINT UNSIGNED NULL COMMENT 'NULL means unlimited until configured otherwise',
    effective_from DATETIME(3) NOT NULL,
    effective_to DATETIME(3) NULL,
    PRIMARY KEY (rule_id),
    UNIQUE KEY uq_repair_rule_code (rule_code),
    UNIQUE KEY uq_repair_rule_version (version_no),
    KEY idx_repair_rule_effective (effective_from, effective_to),
    CONSTRAINT chk_repair_rule_period CHECK (effective_to IS NULL OR effective_to > effective_from),
    CONSTRAINT chk_repair_rule_timeouts CHECK (accept_timeout_minutes > 0 AND normal_repair_minutes > 0 AND urgent_repair_minutes > 0 AND confirm_timeout_days > 0 AND pending_edit_close_days > 0)
) ENGINE=InnoDB COMMENT='Immutable versioned repair rule snapshots';

CREATE TABLE fault_work_type_config (
    config_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    category_id BIGINT UNSIGNED NOT NULL,
    work_type_id BIGINT UNSIGNED NOT NULL,
    valid_from DATETIME(3) NOT NULL,
    valid_to DATETIME(3) NULL,
    PRIMARY KEY (config_id),
    UNIQUE KEY uq_fault_work_type_start (category_id, work_type_id, valid_from),
    KEY idx_fault_work_type_effective (work_type_id, valid_from, valid_to),
    CONSTRAINT fk_fault_work_category FOREIGN KEY (category_id) REFERENCES fault_category (category_id),
    CONSTRAINT fk_fault_work_type FOREIGN KEY (work_type_id) REFERENCES repair_work_type (work_type_id),
    CONSTRAINT chk_fault_work_period CHECK (valid_to IS NULL OR valid_to > valid_from)
) ENGINE=InnoDB COMMENT='Effective-dated fault-to-trade relation';

CREATE TABLE repairer_work_type_qualification (
    qualification_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    repairer_profile_id BIGINT UNSIGNED NOT NULL,
    work_type_id BIGINT UNSIGNED NOT NULL,
    qualification_level VARCHAR(80) NULL,
    valid_from DATE NOT NULL,
    valid_to DATE NULL,
    PRIMARY KEY (qualification_id),
    UNIQUE KEY uq_repairer_trade_start (repairer_profile_id, work_type_id, valid_from),
    KEY idx_repairer_trade_validity (work_type_id, valid_from, valid_to),
    CONSTRAINT fk_qualification_repairer FOREIGN KEY (repairer_profile_id) REFERENCES repairer_profile (repairer_profile_id),
    CONSTRAINT fk_qualification_work_type FOREIGN KEY (work_type_id) REFERENCES repair_work_type (work_type_id),
    CONSTRAINT chk_qualification_period CHECK (valid_to IS NULL OR valid_to > valid_from)
) ENGINE=InnoDB COMMENT='Effective-dated repairer qualification';

CREATE TABLE repairer_building_scope (
    scope_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    repairer_profile_id BIGINT UNSIGNED NOT NULL,
    building_id BIGINT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    PRIMARY KEY (scope_id),
    UNIQUE KEY uq_repairer_building_start (repairer_profile_id, building_id, start_date),
    KEY idx_repairer_scope_building (building_id, start_date, end_date),
    CONSTRAINT fk_repairer_scope_profile FOREIGN KEY (repairer_profile_id) REFERENCES repairer_profile (repairer_profile_id),
    CONSTRAINT fk_repairer_scope_building FOREIGN KEY (building_id) REFERENCES building (building_id),
    CONSTRAINT chk_repairer_scope_period CHECK (end_date IS NULL OR end_date > start_date)
) ENGINE=InnoDB COMMENT='Effective-dated repairer-to-building responsibility';

-- 5. Repair orders, immutable submissions, dispatch and outcome facts
CREATE TABLE repair_order (
    order_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_no VARCHAR(50) NOT NULL,
    student_profile_id BIGINT UNSIGNED NOT NULL,
    rule_id BIGINT UNSIGNED NULL,
    parent_order_id BIGINT UNSIGNED NULL COMMENT 'Direct original order for a rework; NULL for a normal order',
    current_status VARCHAR(30) NOT NULL,
    urgent TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    archived_at DATETIME(3) NULL,
    archive_reason VARCHAR(500) NULL,
    PRIMARY KEY (order_id),
    UNIQUE KEY uq_repair_order_no (order_no),
    KEY idx_repair_order_student_created (student_profile_id, created_at),
    KEY idx_repair_order_status_created (current_status, created_at),
    KEY idx_repair_order_parent (parent_order_id),
    KEY idx_repair_order_rule (rule_id),
    CONSTRAINT fk_repair_order_student FOREIGN KEY (student_profile_id) REFERENCES student_profile (student_profile_id),
    CONSTRAINT fk_repair_order_rule FOREIGN KEY (rule_id) REFERENCES repair_rule (rule_id),
    CONSTRAINT fk_repair_order_parent FOREIGN KEY (parent_order_id) REFERENCES repair_order (order_id),
    CONSTRAINT chk_repair_order_urgent CHECK (urgent IN (0, 1))
) ENGINE=InnoDB COMMENT='Repair aggregate current status and basic identity';

CREATE TABLE repair_submission_version (
    version_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_id BIGINT UNSIGNED NOT NULL,
    version_no INT UNSIGNED NOT NULL,
    room_id BIGINT UNSIGNED NULL,
    category_id BIGINT UNSIGNED NULL,
    work_type_id BIGINT UNSIGNED NULL,
    specific_location VARCHAR(300) NULL,
    fault_description TEXT NULL,
    student_remark TEXT NULL,
    recorded_by_user_id BIGINT UNSIGNED NOT NULL,
    saved_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    submitted_at DATETIME(3) NULL,
    PRIMARY KEY (version_id),
    UNIQUE KEY uq_repair_version_no (order_id, version_no),
    KEY idx_repair_version_submitted (order_id, submitted_at),
    KEY idx_repair_version_room (room_id),
    CONSTRAINT fk_repair_version_order FOREIGN KEY (order_id) REFERENCES repair_order (order_id),
    CONSTRAINT fk_repair_version_room FOREIGN KEY (room_id) REFERENCES dorm_room (room_id),
    CONSTRAINT fk_repair_version_category FOREIGN KEY (category_id) REFERENCES fault_category (category_id),
    CONSTRAINT fk_repair_version_work_type FOREIGN KEY (work_type_id) REFERENCES repair_work_type (work_type_id),
    CONSTRAINT fk_repair_version_user FOREIGN KEY (recorded_by_user_id) REFERENCES sys_user (user_id),
    CONSTRAINT chk_repair_version_no CHECK (version_no > 0)
) ENGINE=InnoDB COMMENT='Editable draft and immutable submitted repair content versions';

CREATE TABLE repair_audit_record (
    audit_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    version_id BIGINT UNSIGNED NOT NULL,
    reviewer_user_id BIGINT UNSIGNED NOT NULL,
    review_stage VARCHAR(30) NOT NULL,
    conclusion VARCHAR(20) NOT NULL COMMENT 'APPROVED or REJECTED; not the order status',
    reason VARCHAR(2000) NULL,
    reviewed_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    resubmit_deadline DATETIME(3) NULL,
    PRIMARY KEY (audit_id),
    KEY idx_repair_audit_version_time (version_id, reviewed_at),
    KEY idx_repair_audit_reviewer_time (reviewer_user_id, reviewed_at),
    CONSTRAINT fk_repair_audit_version FOREIGN KEY (version_id) REFERENCES repair_submission_version (version_id),
    CONSTRAINT fk_repair_audit_user FOREIGN KEY (reviewer_user_id) REFERENCES sys_user (user_id),
    CONSTRAINT chk_repair_audit_conclusion CHECK (conclusion IN ('APPROVED', 'REJECTED')),
    CONSTRAINT chk_repair_audit_reject_reason CHECK (conclusion <> 'REJECTED' OR (reason IS NOT NULL AND resubmit_deadline IS NOT NULL))
) ENGINE=InnoDB COMMENT='Decision history against a specific submitted version';

CREATE TABLE dispatch_record (
    dispatch_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_id BIGINT UNSIGNED NOT NULL,
    repairer_profile_id BIGINT UNSIGNED NOT NULL,
    dispatched_by_user_id BIGINT UNSIGNED NULL,
    dispatch_mode VARCHAR(20) NOT NULL COMMENT 'AUTO or MANUAL_FORCE',
    dispatch_status VARCHAR(20) NOT NULL COMMENT 'PENDING, ACCEPTED, REJECTED, TIMEOUT, CANCELLED',
    reject_reason VARCHAR(1000) NULL,
    dispatched_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    response_at DATETIME(3) NULL,
    assignment_ended_at DATETIME(3) NULL,
    PRIMARY KEY (dispatch_id),
    KEY idx_dispatch_order_history (order_id, dispatched_at),
    KEY idx_dispatch_worker_status (repairer_profile_id, dispatch_status, assignment_ended_at),
    CONSTRAINT fk_dispatch_order FOREIGN KEY (order_id) REFERENCES repair_order (order_id),
    CONSTRAINT fk_dispatch_repairer FOREIGN KEY (repairer_profile_id) REFERENCES repairer_profile (repairer_profile_id),
    CONSTRAINT fk_dispatch_operator FOREIGN KEY (dispatched_by_user_id) REFERENCES sys_user (user_id),
    CONSTRAINT chk_dispatch_mode CHECK (dispatch_mode IN ('AUTO', 'MANUAL_FORCE')),
    CONSTRAINT chk_dispatch_status CHECK (dispatch_status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'TIMEOUT', 'CANCELLED')),
    CONSTRAINT chk_dispatch_actor_mode CHECK ((dispatch_mode = 'AUTO' AND dispatched_by_user_id IS NULL) OR (dispatch_mode = 'MANUAL_FORCE' AND dispatched_by_user_id IS NOT NULL))
) ENGINE=InnoDB COMMENT='One row per dispatch attempt and worker assignment';

CREATE TABLE repair_worker_record (
    worker_record_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    dispatch_id BIGINT UNSIGNED NOT NULL,
    record_type VARCHAR(30) NOT NULL COMMENT 'REPAIR_TIMEOUT or VISIT_NOTE',
    description TEXT NOT NULL,
    occurred_at DATETIME(3) NOT NULL,
    PRIMARY KEY (worker_record_id),
    KEY idx_worker_record_dispatch_type (dispatch_id, record_type, occurred_at),
    CONSTRAINT fk_worker_record_dispatch FOREIGN KEY (dispatch_id) REFERENCES dispatch_record (dispatch_id)
) ENGINE=InnoDB COMMENT='Repair process facts; timeout counts derive from these rows';

CREATE TABLE repair_delay_application (
    delay_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    dispatch_id BIGINT UNSIGNED NOT NULL,
    delay_reason TEXT NOT NULL,
    expected_finish_at DATETIME(3) NOT NULL,
    submitted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    delay_status VARCHAR(24) NOT NULL,
    reviewer_user_id BIGINT UNSIGNED NULL,
    review_reason VARCHAR(2000) NULL,
    reviewed_at DATETIME(3) NULL,
    PRIMARY KEY (delay_id),
    KEY idx_delay_dispatch_status (dispatch_id, delay_status),
    KEY idx_delay_reviewer_time (reviewer_user_id, reviewed_at),
    CONSTRAINT fk_delay_dispatch FOREIGN KEY (dispatch_id) REFERENCES dispatch_record (dispatch_id),
    CONSTRAINT fk_delay_reviewer FOREIGN KEY (reviewer_user_id) REFERENCES sys_user (user_id),
    CONSTRAINT chk_delay_status CHECK (delay_status IN ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'INVALIDATED')),
    CONSTRAINT chk_delay_review_fields CHECK ((delay_status = 'PENDING_REVIEW' AND reviewed_at IS NULL) OR (delay_status <> 'PENDING_REVIEW' AND reviewed_at IS NOT NULL)),
    CONSTRAINT chk_delay_reject_reason CHECK (delay_status <> 'REJECTED' OR review_reason IS NOT NULL)
) ENGINE=InnoDB COMMENT='Repair deadline extension request and decision';

CREATE TABLE repair_result (
    result_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_id BIGINT UNSIGNED NOT NULL,
    submitted_by_repairer_id BIGINT UNSIGNED NOT NULL,
    repair_description TEXT NOT NULL,
    submitted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (result_id),
    UNIQUE KEY uq_repair_result_order (order_id),
    KEY idx_repair_result_submitted (submitted_at),
    CONSTRAINT fk_repair_result_order FOREIGN KEY (order_id) REFERENCES repair_order (order_id),
    CONSTRAINT fk_repair_result_repairer FOREIGN KEY (submitted_by_repairer_id) REFERENCES repairer_profile (repairer_profile_id)
) ENGINE=InnoDB COMMENT='One final completion result per repair order';

CREATE TABLE repair_confirmation (
    confirmation_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    result_id BIGINT UNSIGNED NOT NULL,
    confirmation_mode VARCHAR(20) NOT NULL COMMENT 'STUDENT or SYSTEM',
    confirmed_by_user_id BIGINT UNSIGNED NULL COMMENT 'NULL for system automatic confirmation',
    opinion VARCHAR(2000) NULL,
    confirmed_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (confirmation_id),
    UNIQUE KEY uq_confirmation_result (result_id),
    KEY idx_confirmation_actor_time (confirmed_by_user_id, confirmed_at),
    CONSTRAINT fk_confirmation_result FOREIGN KEY (result_id) REFERENCES repair_result (result_id),
    CONSTRAINT fk_confirmation_user FOREIGN KEY (confirmed_by_user_id) REFERENCES sys_user (user_id),
    CONSTRAINT chk_confirmation_mode CHECK (confirmation_mode IN ('STUDENT', 'SYSTEM')),
    CONSTRAINT chk_confirmation_actor CHECK ((confirmation_mode = 'STUDENT' AND confirmed_by_user_id IS NOT NULL) OR (confirmation_mode = 'SYSTEM' AND confirmed_by_user_id IS NULL))
) ENGINE=InnoDB COMMENT='Student or system confirmation fact';

CREATE TABLE repair_evaluation (
    evaluation_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    confirmation_id BIGINT UNSIGNED NOT NULL,
    score SMALLINT UNSIGNED NOT NULL COMMENT 'Allowed scale is pending business confirmation',
    content VARCHAR(2000) NULL,
    evaluated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (evaluation_id),
    UNIQUE KEY uq_evaluation_confirmation (confirmation_id),
    KEY idx_evaluation_score_time (score, evaluated_at),
    CONSTRAINT fk_evaluation_confirmation FOREIGN KEY (confirmation_id) REFERENCES repair_confirmation (confirmation_id)
) ENGINE=InnoDB COMMENT='One optional evaluation per confirmation; score scale pending confirmation';

CREATE TABLE work_order_exception_record (
    exception_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_id BIGINT UNSIGNED NOT NULL,
    exception_type VARCHAR(40) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    occurred_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    handled_by_user_id BIGINT UNSIGNED NULL,
    handled_at DATETIME(3) NULL,
    handling_result VARCHAR(2000) NULL,
    PRIMARY KEY (exception_id),
    KEY idx_exception_order_time (order_id, occurred_at),
    KEY idx_exception_open (handled_at, exception_type),
    CONSTRAINT fk_exception_order FOREIGN KEY (order_id) REFERENCES repair_order (order_id),
    CONSTRAINT fk_exception_handler FOREIGN KEY (handled_by_user_id) REFERENCES sys_user (user_id),
    CONSTRAINT chk_exception_handled_fields CHECK ((handled_at IS NULL AND handled_by_user_id IS NULL) OR (handled_at IS NOT NULL AND handled_by_user_id IS NOT NULL))
) ENGINE=InnoDB COMMENT='Human handling and exceptional dispatch facts';

-- 6. Holiday stay batches and applications
CREATE TABLE stay_batch (
    batch_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    batch_code VARCHAR(60) NOT NULL,
    batch_name VARCHAR(160) NOT NULL,
    holiday_type VARCHAR(30) NOT NULL,
    batch_status VARCHAR(30) NOT NULL,
    created_by_user_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (batch_id),
    UNIQUE KEY uq_stay_batch_code (batch_code),
    KEY idx_stay_batch_status (batch_status),
    CONSTRAINT fk_stay_batch_creator FOREIGN KEY (created_by_user_id) REFERENCES sys_user (user_id)
) ENGINE=InnoDB COMMENT='One application cycle for one holiday';

CREATE TABLE stay_batch_version (
    batch_version_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    batch_id BIGINT UNSIGNED NOT NULL,
    version_no INT UNSIGNED NOT NULL,
    open_start_date DATE NOT NULL,
    open_end_date DATE NOT NULL,
    instructions TEXT NOT NULL,
    published_by_user_id BIGINT UNSIGNED NOT NULL,
    published_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (batch_version_id),
    UNIQUE KEY uq_stay_batch_version_no (batch_id, version_no),
    KEY idx_stay_batch_version_published (batch_id, published_at),
    CONSTRAINT fk_stay_batch_version_batch FOREIGN KEY (batch_id) REFERENCES stay_batch (batch_id),
    CONSTRAINT fk_stay_batch_version_user FOREIGN KEY (published_by_user_id) REFERENCES sys_user (user_id),
    CONSTRAINT chk_stay_batch_open_period CHECK (open_end_date >= open_start_date)
) ENGINE=InnoDB COMMENT='Immutable continuous holiday open-interval revisions';

CREATE TABLE stay_batch_building_rule (
    building_rule_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    batch_id BIGINT UNSIGNED NOT NULL,
    building_id BIGINT UNSIGNED NOT NULL,
    application_deadline DATETIME(3) NOT NULL,
    auto_lock TINYINT(1) NOT NULL DEFAULT 0,
    building_instructions VARCHAR(2000) NULL,
    rule_status VARCHAR(30) NOT NULL,
    configured_by_user_id BIGINT UNSIGNED NOT NULL,
    published_at DATETIME(3) NULL,
    PRIMARY KEY (building_rule_id),
    UNIQUE KEY uq_stay_batch_building (batch_id, building_id),
    KEY idx_stay_building_deadline (building_id, application_deadline, rule_status),
    CONSTRAINT fk_stay_building_batch FOREIGN KEY (batch_id) REFERENCES stay_batch (batch_id),
    CONSTRAINT fk_stay_building_building FOREIGN KEY (building_id) REFERENCES building (building_id),
    CONSTRAINT fk_stay_building_configurer FOREIGN KEY (configured_by_user_id) REFERENCES sys_user (user_id),
    CONSTRAINT chk_stay_building_auto_lock CHECK (auto_lock IN (0, 1))
) ENGINE=InnoDB COMMENT='Per-building application deadline and lock rule';

CREATE TABLE stay_application (
    application_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    student_profile_id BIGINT UNSIGNED NOT NULL,
    batch_id BIGINT UNSIGNED NOT NULL,
    application_source VARCHAR(24) NOT NULL,
    current_status VARCHAR(24) NOT NULL,
    created_by_user_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    completed_at DATETIME(3) NULL,
    archived_at DATETIME(3) NULL,
    archive_reason VARCHAR(500) NULL,
    PRIMARY KEY (application_id),
    UNIQUE KEY uq_stay_student_batch (student_profile_id, batch_id),
    KEY idx_stay_application_batch_status (batch_id, current_status),
    KEY idx_stay_application_status_created (current_status, created_at),
    CONSTRAINT fk_stay_application_student FOREIGN KEY (student_profile_id) REFERENCES student_profile (student_profile_id),
    CONSTRAINT fk_stay_application_batch FOREIGN KEY (batch_id) REFERENCES stay_batch (batch_id),
    CONSTRAINT fk_stay_application_creator FOREIGN KEY (created_by_user_id) REFERENCES sys_user (user_id),
    CONSTRAINT chk_stay_application_source CHECK (application_source IN ('NORMAL', 'LATE', 'ADMIN_ADDED')),
    CONSTRAINT chk_stay_application_status CHECK (current_status IN ('DRAFT', 'PENDING_REVIEW', 'UNDER_REVIEW', 'PENDING_EDIT', 'APPROVED', 'COMPLETED', 'ARCHIVED')),
    CONSTRAINT chk_stay_application_lifecycle CHECK ((completed_at IS NULL OR archived_at IS NOT NULL) AND (archived_at IS NOT NULL OR archive_reason IS NULL))
) ENGINE=InnoDB COMMENT='One application per student and batch; drafts are not counted as submitted';

CREATE TABLE stay_application_scope (
    application_id BIGINT UNSIGNED NOT NULL,
    building_rule_id BIGINT UNSIGNED NOT NULL,
    assigned_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (application_id),
    CONSTRAINT fk_stay_scope_application FOREIGN KEY (application_id) REFERENCES stay_application (application_id),
    CONSTRAINT fk_stay_scope_rule FOREIGN KEY (building_rule_id) REFERENCES stay_batch_building_rule (building_rule_id)
) ENGINE=InnoDB COMMENT='One receiving building rule for an application; validate batch match transactionally';

CREATE TABLE stay_submission_version (
    version_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    application_id BIGINT UNSIGNED NOT NULL,
    version_no INT UNSIGNED NOT NULL,
    application_reason TEXT NOT NULL,
    recorded_by_user_id BIGINT UNSIGNED NOT NULL,
    saved_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    submitted_at DATETIME(3) NULL,
    PRIMARY KEY (version_id),
    UNIQUE KEY uq_stay_version_no (application_id, version_no),
    KEY idx_stay_version_submitted (application_id, submitted_at),
    CONSTRAINT fk_stay_version_application FOREIGN KEY (application_id) REFERENCES stay_application (application_id),
    CONSTRAINT fk_stay_version_user FOREIGN KEY (recorded_by_user_id) REFERENCES sys_user (user_id),
    CONSTRAINT chk_stay_version_no CHECK (version_no > 0)
) ENGINE=InnoDB COMMENT='Draft and immutable submitted versions of a stay application';

CREATE TABLE stay_date_range (
    range_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    version_id BIGINT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    PRIMARY KEY (range_id),
    KEY idx_stay_range_version_date (version_id, start_date, end_date),
    CONSTRAINT fk_stay_range_version FOREIGN KEY (version_id) REFERENCES stay_submission_version (version_id),
    CONSTRAINT chk_stay_date_range CHECK (end_date >= start_date)
) ENGINE=InnoDB COMMENT='Inclusive date ranges belonging to one submission version';

CREATE TABLE stay_review_record (
    review_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    version_id BIGINT UNSIGNED NOT NULL,
    batch_version_id BIGINT UNSIGNED NOT NULL,
    round_no INT UNSIGNED NOT NULL,
    review_type VARCHAR(32) NOT NULL,
    review_status VARCHAR(20) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    reviewer_user_id BIGINT UNSIGNED NULL,
    reason VARCHAR(2000) NULL,
    reviewed_at DATETIME(3) NULL,
    resubmit_deadline DATETIME(3) NULL,
    PRIMARY KEY (review_id),
    UNIQUE KEY uq_stay_review_round (version_id, batch_version_id, review_type, round_no),
    KEY idx_stay_review_status_created (review_status, created_at),
    KEY idx_stay_review_user_time (reviewer_user_id, reviewed_at),
    CONSTRAINT fk_stay_review_version FOREIGN KEY (version_id) REFERENCES stay_submission_version (version_id),
    CONSTRAINT fk_stay_review_batch_version FOREIGN KEY (batch_version_id) REFERENCES stay_batch_version (batch_version_id),
    CONSTRAINT fk_stay_review_reviewer FOREIGN KEY (reviewer_user_id) REFERENCES sys_user (user_id),
    CONSTRAINT chk_stay_review_status CHECK (review_status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    CONSTRAINT chk_stay_review_round CHECK (round_no > 0),
    CONSTRAINT chk_stay_review_completion CHECK ((review_status = 'PENDING' AND reviewed_at IS NULL AND reviewer_user_id IS NULL) OR (review_status <> 'PENDING' AND reviewed_at IS NOT NULL AND reviewer_user_id IS NOT NULL)),
    CONSTRAINT chk_stay_review_rejection CHECK (review_status <> 'REJECTED' OR (reason IS NOT NULL AND resubmit_deadline IS NOT NULL))
) ENGINE=InnoDB COMMENT='Review facts reference both submitted content and open-range revision';

CREATE TABLE stay_exception_authorization (
    authorization_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    student_profile_id BIGINT UNSIGNED NOT NULL,
    building_rule_id BIGINT UNSIGNED NOT NULL,
    exception_type VARCHAR(32) NOT NULL,
    authorization_reason VARCHAR(2000) NOT NULL,
    authorized_by_user_id BIGINT UNSIGNED NOT NULL,
    granted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    valid_from DATETIME(3) NOT NULL,
    valid_to DATETIME(3) NOT NULL,
    revoked_by_user_id BIGINT UNSIGNED NULL,
    revoked_at DATETIME(3) NULL,
    PRIMARY KEY (authorization_id),
    KEY idx_stay_exception_student_rule (student_profile_id, building_rule_id, valid_from, valid_to),
    CONSTRAINT fk_stay_exception_student FOREIGN KEY (student_profile_id) REFERENCES student_profile (student_profile_id),
    CONSTRAINT fk_stay_exception_rule FOREIGN KEY (building_rule_id) REFERENCES stay_batch_building_rule (building_rule_id),
    CONSTRAINT fk_stay_exception_authorizer FOREIGN KEY (authorized_by_user_id) REFERENCES sys_user (user_id),
    CONSTRAINT fk_stay_exception_revoker FOREIGN KEY (revoked_by_user_id) REFERENCES sys_user (user_id),
    CONSTRAINT chk_stay_exception_period CHECK (valid_to > valid_from),
    CONSTRAINT chk_stay_exception_revoke CHECK ((revoked_at IS NULL AND revoked_by_user_id IS NULL) OR (revoked_at IS NOT NULL AND revoked_by_user_id IS NOT NULL))
) ENGINE=InnoDB COMMENT='Time-limited exception granted to one student for one building rule';

CREATE TABLE stay_version_authorization (
    version_id BIGINT UNSIGNED NOT NULL,
    authorization_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (version_id, authorization_id),
    CONSTRAINT fk_stay_version_auth_version FOREIGN KEY (version_id) REFERENCES stay_submission_version (version_id),
    CONSTRAINT fk_stay_version_auth_authorization FOREIGN KEY (authorization_id) REFERENCES stay_exception_authorization (authorization_id)
) ENGINE=InnoDB COMMENT='Exception authorization evidence used by a submitted version';

-- 7. Site notices and per-user receipt facts
CREATE TABLE site_message (
    message_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(240) NOT NULL,
    body TEXT NOT NULL,
    message_type VARCHAR(32) NOT NULL,
    publisher_user_id BIGINT UNSIGNED NULL COMMENT 'NULL for a system-generated business notice',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    published_at DATETIME(3) NULL,
    send_status VARCHAR(24) NOT NULL,
    PRIMARY KEY (message_id),
    KEY idx_site_message_status_published (send_status, published_at),
    KEY idx_site_message_publisher_time (publisher_user_id, created_at),
    CONSTRAINT fk_site_message_publisher FOREIGN KEY (publisher_user_id) REFERENCES sys_user (user_id)
) ENGINE=InnoDB COMMENT='Notice content and publication lifecycle';

CREATE TABLE message_target (
    target_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    message_id BIGINT UNSIGNED NOT NULL,
    target_type VARCHAR(16) NOT NULL COMMENT 'ALL, ROLE, BUILDING, USER',
    role_id BIGINT UNSIGNED NULL,
    building_id BIGINT UNSIGNED NULL,
    user_id BIGINT UNSIGNED NULL,
    PRIMARY KEY (target_id),
    KEY idx_message_target_message (message_id),
    KEY idx_message_target_role (role_id),
    KEY idx_message_target_building (building_id),
    KEY idx_message_target_user (user_id),
    CONSTRAINT fk_message_target_message FOREIGN KEY (message_id) REFERENCES site_message (message_id),
    CONSTRAINT fk_message_target_role FOREIGN KEY (role_id) REFERENCES role (role_id),
    CONSTRAINT fk_message_target_building FOREIGN KEY (building_id) REFERENCES building (building_id),
    CONSTRAINT fk_message_target_user FOREIGN KEY (user_id) REFERENCES sys_user (user_id),
    CONSTRAINT chk_message_target_shape CHECK (
        (target_type = 'ALL' AND role_id IS NULL AND building_id IS NULL AND user_id IS NULL) OR
        (target_type = 'ROLE' AND role_id IS NOT NULL AND building_id IS NULL AND user_id IS NULL) OR
        (target_type = 'BUILDING' AND role_id IS NULL AND building_id IS NOT NULL AND user_id IS NULL) OR
        (target_type = 'USER' AND role_id IS NULL AND building_id IS NULL AND user_id IS NOT NULL)
    )
) ENGINE=InnoDB COMMENT='One audience selector per row; expand and deduplicate users when publishing';

CREATE TABLE message_receipt (
    message_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    received_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    read_at DATETIME(3) NULL,
    PRIMARY KEY (message_id, user_id),
    KEY idx_message_receipt_user_read (user_id, read_at, received_at),
    CONSTRAINT fk_message_receipt_message FOREIGN KEY (message_id) REFERENCES site_message (message_id),
    CONSTRAINT fk_message_receipt_user FOREIGN KEY (user_id) REFERENCES sys_user (user_id)
) ENGINE=InnoDB COMMENT='One receipt per message and user; read state derives from read_at';

-- 8. File metadata and typed business attachment relations
CREATE TABLE file_resource (
    file_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    original_name VARCHAR(512) NOT NULL,
    storage_key VARCHAR(512) NOT NULL,
    file_type VARCHAR(160) NOT NULL,
    byte_size BIGINT UNSIGNED NOT NULL,
    checksum CHAR(64) NULL,
    uploaded_by_user_id BIGINT UNSIGNED NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    file_status VARCHAR(24) NOT NULL,
    PRIMARY KEY (file_id),
    UNIQUE KEY uq_file_storage_key (storage_key),
    KEY idx_file_uploader_time (uploaded_by_user_id, created_at),
    CONSTRAINT fk_file_uploader FOREIGN KEY (uploaded_by_user_id) REFERENCES sys_user (user_id)
) ENGINE=InnoDB COMMENT='File metadata; access URL is derived from storage configuration and key';

CREATE TABLE repair_version_file (
    version_id BIGINT UNSIGNED NOT NULL,
    file_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (version_id, file_id),
    KEY idx_repair_version_file_file (file_id),
    CONSTRAINT fk_repair_version_file_version FOREIGN KEY (version_id) REFERENCES repair_submission_version (version_id),
    CONSTRAINT fk_repair_version_file_file FOREIGN KEY (file_id) REFERENCES file_resource (file_id)
) ENGINE=InnoDB COMMENT='Fault image relation';

CREATE TABLE repair_delay_file (
    delay_id BIGINT UNSIGNED NOT NULL,
    file_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (delay_id, file_id),
    KEY idx_repair_delay_file_file (file_id),
    CONSTRAINT fk_repair_delay_file_delay FOREIGN KEY (delay_id) REFERENCES repair_delay_application (delay_id),
    CONSTRAINT fk_repair_delay_file_file FOREIGN KEY (file_id) REFERENCES file_resource (file_id)
) ENGINE=InnoDB COMMENT='On-site photo relation for a delay request';

CREATE TABLE repair_result_file (
    result_id BIGINT UNSIGNED NOT NULL,
    file_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (result_id, file_id),
    KEY idx_repair_result_file_file (file_id),
    CONSTRAINT fk_repair_result_file_result FOREIGN KEY (result_id) REFERENCES repair_result (result_id),
    CONSTRAINT fk_repair_result_file_file FOREIGN KEY (file_id) REFERENCES file_resource (file_id)
) ENGINE=InnoDB COMMENT='Completion photo relation';

CREATE TABLE message_file (
    message_id BIGINT UNSIGNED NOT NULL,
    file_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (message_id, file_id),
    KEY idx_message_file_file (file_id),
    CONSTRAINT fk_message_file_message FOREIGN KEY (message_id) REFERENCES site_message (message_id),
    CONSTRAINT fk_message_file_file FOREIGN KEY (file_id) REFERENCES file_resource (file_id)
) ENGINE=InnoDB COMMENT='Notice attachment relation';

-- 9. Import/export, backup/recovery, authentication and audit records
CREATE TABLE import_export_task (
    task_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    task_no VARCHAR(60) NOT NULL,
    initiated_by_user_id BIGINT UNSIGNED NOT NULL,
    task_type VARCHAR(12) NOT NULL,
    business_object_type VARCHAR(40) NOT NULL,
    task_status VARCHAR(20) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    started_at DATETIME(3) NULL,
    finished_at DATETIME(3) NULL,
    result_description VARCHAR(4000) NULL,
    PRIMARY KEY (task_id),
    UNIQUE KEY uq_import_export_task_no (task_no),
    KEY idx_import_export_status_created (task_status, created_at),
    KEY idx_import_export_initiator_created (initiated_by_user_id, created_at),
    CONSTRAINT fk_import_export_initiator FOREIGN KEY (initiated_by_user_id) REFERENCES sys_user (user_id),
    CONSTRAINT chk_import_export_type CHECK (task_type IN ('IMPORT', 'EXPORT')),
    CONSTRAINT chk_import_export_status CHECK (task_status IN ('WAITING', 'RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED', 'CANCELLED')),
    CONSTRAINT chk_import_export_time_order CHECK (finished_at IS NULL OR (started_at IS NOT NULL AND finished_at >= started_at)),
    CONSTRAINT chk_import_export_partial CHECK (task_status <> 'PARTIAL' OR task_type = 'IMPORT')
) ENGINE=InnoDB COMMENT='Import and export execution facts; query parameters are not persisted business data';

CREATE TABLE import_error_detail (
    error_detail_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    task_id BIGINT UNSIGNED NOT NULL,
    row_no BIGINT UNSIGNED NOT NULL,
    field_name VARCHAR(160) NULL,
    raw_value TEXT NULL,
    error_reason VARCHAR(2000) NOT NULL,
    PRIMARY KEY (error_detail_id),
    UNIQUE KEY uq_import_error_row_field (task_id, row_no, field_name),
    KEY idx_import_error_task_row (task_id, row_no),
    CONSTRAINT fk_import_error_task FOREIGN KEY (task_id) REFERENCES import_export_task (task_id)
) ENGINE=InnoDB COMMENT='Per-row import validation and write errors';

CREATE TABLE backup_task (
    task_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    task_no VARCHAR(60) NOT NULL,
    initiated_by_user_id BIGINT UNSIGNED NOT NULL,
    protection_backup_task_id BIGINT UNSIGNED NULL,
    task_type VARCHAR(12) NOT NULL,
    backup_scope VARCHAR(300) NOT NULL,
    task_status VARCHAR(20) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    restore_confirmed_at DATETIME(3) NULL,
    started_at DATETIME(3) NULL,
    finished_at DATETIME(3) NULL,
    checksum_passed TINYINT(1) NULL,
    failure_reason VARCHAR(4000) NULL,
    rollback_result VARCHAR(4000) NULL,
    PRIMARY KEY (task_id),
    UNIQUE KEY uq_backup_task_no (task_no),
    KEY idx_backup_status_created (task_status, created_at),
    KEY idx_backup_protection_task (protection_backup_task_id),
    CONSTRAINT fk_backup_initiator FOREIGN KEY (initiated_by_user_id) REFERENCES sys_user (user_id),
    CONSTRAINT fk_backup_protection FOREIGN KEY (protection_backup_task_id) REFERENCES backup_task (task_id),
    CONSTRAINT chk_backup_type CHECK (task_type IN ('BACKUP', 'RESTORE')),
    CONSTRAINT chk_backup_status CHECK (task_status IN ('WAITING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED')),
    CONSTRAINT chk_backup_checksum CHECK (checksum_passed IS NULL OR checksum_passed IN (0, 1)),
    CONSTRAINT chk_backup_restore_fields CHECK ((task_type = 'BACKUP' AND restore_confirmed_at IS NULL AND protection_backup_task_id IS NULL) OR task_type = 'RESTORE'),
    CONSTRAINT chk_backup_time_order CHECK (finished_at IS NULL OR (started_at IS NOT NULL AND finished_at >= started_at))
) ENGINE=InnoDB COMMENT='Separate backup and restore task facts';

CREATE TABLE import_export_task_file (
    task_id BIGINT UNSIGNED NOT NULL,
    file_id BIGINT UNSIGNED NOT NULL,
    file_purpose VARCHAR(20) NOT NULL,
    PRIMARY KEY (task_id, file_id),
    KEY idx_import_export_task_file_file (file_id),
    CONSTRAINT fk_import_export_task_file_task FOREIGN KEY (task_id) REFERENCES import_export_task (task_id),
    CONSTRAINT fk_import_export_task_file_file FOREIGN KEY (file_id) REFERENCES file_resource (file_id),
    CONSTRAINT chk_import_export_file_purpose CHECK (file_purpose IN ('INPUT', 'OUTPUT', 'ERROR_REPORT'))
) ENGINE=InnoDB COMMENT='Typed input/output/error report file relation';

CREATE TABLE backup_task_file (
    task_id BIGINT UNSIGNED NOT NULL,
    file_id BIGINT UNSIGNED NOT NULL,
    file_purpose VARCHAR(24) NOT NULL,
    PRIMARY KEY (task_id, file_id),
    KEY idx_backup_task_file_file (file_id),
    CONSTRAINT fk_backup_task_file_task FOREIGN KEY (task_id) REFERENCES backup_task (task_id),
    CONSTRAINT fk_backup_task_file_file FOREIGN KEY (file_id) REFERENCES file_resource (file_id),
    CONSTRAINT chk_backup_file_purpose CHECK (file_purpose IN ('BACKUP_OUTPUT', 'RESTORE_INPUT'))
) ENGINE=InnoDB COMMENT='Typed backup output or restore input file relation';

CREATE TABLE login_log (
    login_log_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NULL,
    attempted_login_account VARCHAR(100) NOT NULL,
    attempted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    login_result VARCHAR(16) NOT NULL,
    source_address VARCHAR(64) NULL,
    device_info VARCHAR(500) NULL,
    failure_reason VARCHAR(500) NULL,
    PRIMARY KEY (login_log_id),
    KEY idx_login_log_account_time (attempted_login_account, attempted_at),
    KEY idx_login_log_user_time (user_id, attempted_at),
    CONSTRAINT fk_login_log_user FOREIGN KEY (user_id) REFERENCES sys_user (user_id),
    CONSTRAINT chk_login_log_result CHECK (login_result IN ('SUCCESS', 'FAILURE'))
) ENGINE=InnoDB COMMENT='Login attempts, including unknown-account failures';

CREATE TABLE operation_log (
    operation_log_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    operator_user_id BIGINT UNSIGNED NULL,
    actor_type VARCHAR(12) NOT NULL,
    operated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    module_name VARCHAR(60) NOT NULL,
    operation_type VARCHAR(80) NOT NULL,
    object_type VARCHAR(80) NULL,
    object_id BIGINT UNSIGNED NULL COMMENT 'Polymorphic audit locator, intentionally not an FK',
    operation_result VARCHAR(24) NOT NULL,
    description VARCHAR(4000) NULL,
    source_address VARCHAR(64) NULL,
    PRIMARY KEY (operation_log_id),
    KEY idx_operation_actor_time (operator_user_id, operated_at),
    KEY idx_operation_module_type_time (module_name, operation_type, operated_at),
    KEY idx_operation_object (object_type, object_id, operated_at),
    CONSTRAINT fk_operation_log_user FOREIGN KEY (operator_user_id) REFERENCES sys_user (user_id),
    CONSTRAINT chk_operation_actor CHECK (actor_type IN ('USER', 'SYSTEM')),
    CONSTRAINT chk_operation_actor_user CHECK ((actor_type = 'USER' AND operator_user_id IS NOT NULL) OR (actor_type = 'SYSTEM' AND operator_user_id IS NULL))
) ENGINE=InnoDB COMMENT='Audit facts; not a replacement for domain event records';

-- Typed file relations for task tables are created after their parent tasks and file_resource.

-- 10. Query views: derived and export-only data is not duplicated in base tables
CREATE OR REPLACE VIEW v_student_accommodation_current AS
SELECT
    a.assignment_id,
    a.student_profile_id,
    u.real_name AS student_name,
    sp.student_no,
    a.bed_id,
    b.bed_no,
    r.room_id,
    r.room_no,
    bd.building_id,
    bd.building_code,
    bd.building_name,
    a.check_in_date,
    a.check_out_date
FROM accommodation_assignment a
JOIN student_profile sp ON sp.student_profile_id = a.student_profile_id
JOIN sys_user u ON u.user_id = sp.user_id
JOIN bed b ON b.bed_id = a.bed_id
JOIN dorm_room r ON r.room_id = b.room_id
JOIN building bd ON bd.building_id = r.building_id
WHERE a.cancelled_at IS NULL
  AND a.check_in_date <= CURRENT_DATE()
  AND (a.check_out_date IS NULL OR CURRENT_DATE() < a.check_out_date);

CREATE OR REPLACE VIEW v_bed_occupancy_current AS
SELECT
    b.bed_id,
    b.room_id,
    b.bed_no,
    b.management_status,
    (a.assignment_id IS NOT NULL) AS occupied,
    a.student_profile_id,
    a.check_in_date,
    a.check_out_date
FROM bed b
LEFT JOIN accommodation_assignment a
  ON a.bed_id = b.bed_id
 AND a.cancelled_at IS NULL
 AND a.check_in_date <= CURRENT_DATE()
 AND (a.check_out_date IS NULL OR CURRENT_DATE() < a.check_out_date);

CREATE OR REPLACE VIEW v_student_academic_detail AS
SELECT
    sp.student_profile_id,
    sp.student_no,
    u.user_id,
    u.login_account,
    u.real_name,
    u.phone,
    u.email,
    sp.enrollment_status,
    c.class_id,
    c.class_code,
    c.class_name,
    m.major_id,
    m.major_code,
    m.major_name,
    d.department_id,
    d.department_code,
    d.department_name
FROM student_profile sp
JOIN sys_user u ON u.user_id = sp.user_id
LEFT JOIN student_class c ON c.class_id = sp.class_id
LEFT JOIN major m ON m.major_id = c.major_id
LEFT JOIN department d ON d.department_id = m.department_id;

CREATE OR REPLACE VIEW v_dorm_room_capacity AS
SELECT
    bd.building_id,
    bd.building_name,
    r.room_id,
    r.room_no,
    r.floor_no,
    r.design_capacity,
    COUNT(DISTINCT b.bed_id) AS configured_bed_count,
    COUNT(DISTINCT CASE WHEN a.assignment_id IS NOT NULL THEN b.bed_id END) AS occupied_bed_count
FROM building bd
JOIN dorm_room r ON r.building_id = bd.building_id
LEFT JOIN bed b ON b.room_id = r.room_id
LEFT JOIN accommodation_assignment a
  ON a.bed_id = b.bed_id
 AND a.cancelled_at IS NULL
 AND a.check_in_date <= CURRENT_DATE()
 AND (a.check_out_date IS NULL OR CURRENT_DATE() < a.check_out_date)
GROUP BY bd.building_id, bd.building_name, r.room_id, r.room_no, r.floor_no, r.design_capacity;

CREATE OR REPLACE VIEW v_repair_worker_current_load AS
SELECT
    rp.repairer_profile_id,
    rp.employee_no,
    u.real_name AS repairer_name,
    rp.max_active_orders,
    COUNT(DISTINCT CASE
        WHEN ro.current_status IN ('PENDING_ACCEPT', 'ACCEPTED', 'DELAYED', 'REPAIRED', 'CONFIRMED')
        THEN dr.order_id END) AS current_order_count
FROM repairer_profile rp
JOIN sys_user u ON u.user_id = rp.user_id
LEFT JOIN dispatch_record dr
  ON dr.repairer_profile_id = rp.repairer_profile_id
 AND dr.dispatch_status IN ('PENDING', 'ACCEPTED')
 AND dr.assignment_ended_at IS NULL
LEFT JOIN repair_order ro ON ro.order_id = dr.order_id
GROUP BY rp.repairer_profile_id, rp.employee_no, u.real_name, rp.max_active_orders;

CREATE OR REPLACE VIEW v_dispatch_deadlines AS
SELECT
    dr.dispatch_id,
    dr.order_id,
    dr.repairer_profile_id,
    dr.dispatch_status,
    CASE
        WHEN dr.dispatch_mode <> 'AUTO' OR dr.dispatch_status <> 'PENDING'
             OR dr.assignment_ended_at IS NOT NULL OR ro.current_status <> 'PENDING_ACCEPT' THEN NULL
        ELSE DATE_ADD(dr.dispatched_at, INTERVAL rr.accept_timeout_minutes MINUTE)
    END AS accept_deadline,
    CASE
        WHEN ro.current_status NOT IN ('ACCEPTED', 'DELAYED') THEN NULL
        WHEN dr.dispatch_status <> 'ACCEPTED' OR dr.assignment_ended_at IS NOT NULL THEN NULL
        WHEN EXISTS (
            SELECT 1 FROM repair_delay_application pending_delay
            WHERE pending_delay.dispatch_id = dr.dispatch_id
              AND pending_delay.delay_status = 'PENDING_REVIEW'
        ) THEN NULL
        WHEN approved_delay.dispatch_id IS NOT NULL THEN approved_delay.expected_finish_at
        ELSE DATE_ADD(
            COALESCE(dr.response_at, dr.dispatched_at),
            INTERVAL CASE WHEN ro.urgent = 1 THEN rr.urgent_repair_minutes ELSE rr.normal_repair_minutes END MINUTE
        )
    END AS repair_deadline
FROM dispatch_record dr
JOIN repair_order ro ON ro.order_id = dr.order_id
JOIN repair_rule rr ON rr.rule_id = ro.rule_id
LEFT JOIN (
    SELECT ranked.dispatch_id, ranked.expected_finish_at
    FROM (
        SELECT d.dispatch_id, d.expected_finish_at,
               ROW_NUMBER() OVER (PARTITION BY d.dispatch_id ORDER BY d.reviewed_at DESC, d.delay_id DESC) AS rn
        FROM repair_delay_application d
        WHERE d.delay_status = 'APPROVED'
    ) ranked
    WHERE ranked.rn = 1
) approved_delay ON approved_delay.dispatch_id = dr.dispatch_id;

CREATE OR REPLACE VIEW v_repair_confirmation_deadline AS
SELECT
    res.result_id,
    res.order_id,
    res.submitted_at,
    DATE_ADD(res.submitted_at, INTERVAL rr.confirm_timeout_days DAY) AS confirmation_deadline
FROM repair_result res
JOIN repair_order ro ON ro.order_id = res.order_id
JOIN repair_rule rr ON rr.rule_id = ro.rule_id;

CREATE OR REPLACE VIEW v_repair_order_dashboard AS
WITH RECURSIVE rework_tree AS (
    SELECT order_id, order_id AS root_order_id
    FROM repair_order
    WHERE parent_order_id IS NULL
    UNION ALL
    SELECT child.order_id, tree.root_order_id
    FROM rework_tree tree
    JOIN repair_order child ON child.parent_order_id = tree.order_id
), rework_counts AS (
    SELECT root_order_id, COUNT(*) - 1 AS rework_count
    FROM rework_tree
    GROUP BY root_order_id
)
SELECT
    ro.order_id,
    ro.order_no,
    ro.current_status,
    ro.urgent,
    ro.student_profile_id,
    ro.created_at,
    sv.version_id AS current_submitted_version_id,
    sv.submitted_at AS current_submission_at,
    sv.room_id,
    sv.category_id,
    sv.work_type_id,
    sv.specific_location,
    sv.fault_description,
    COALESCE(dm.reject_count, 0) AS reject_count,
    COALESCE(dm.accept_timeout_count, 0) AS accept_timeout_count,
    COALESCE(wm.repair_timeout_count, 0) AS repair_timeout_count,
    (COALESCE(dm.reject_count, 0) + COALESCE(dm.accept_timeout_count, 0) > 2
      OR COALESCE(wm.repair_timeout_count, 0) >= 1) AS abnormal,
    COALESCE(rw.rework_count, 0) AS rework_count
FROM repair_order ro
LEFT JOIN (
    SELECT ranked.*
    FROM (
        SELECT v.*,
               ROW_NUMBER() OVER (PARTITION BY v.order_id ORDER BY v.version_no DESC) AS rn
        FROM repair_submission_version v
        WHERE v.submitted_at IS NOT NULL
    ) ranked
    WHERE ranked.rn = 1
) sv ON sv.order_id = ro.order_id
LEFT JOIN (
    SELECT order_id,
           SUM(dispatch_status = 'REJECTED') AS reject_count,
           SUM(dispatch_status = 'TIMEOUT') AS accept_timeout_count
    FROM dispatch_record
    GROUP BY order_id
) dm ON dm.order_id = ro.order_id
LEFT JOIN (
    SELECT dr.order_id,
           SUM(wr.record_type = 'REPAIR_TIMEOUT') AS repair_timeout_count
    FROM dispatch_record dr
    JOIN repair_worker_record wr ON wr.dispatch_id = dr.dispatch_id
    GROUP BY dr.order_id
) wm ON wm.order_id = ro.order_id
JOIN rework_tree order_root ON order_root.order_id = ro.order_id
LEFT JOIN rework_counts rw ON rw.root_order_id = order_root.root_order_id;

CREATE OR REPLACE VIEW v_stay_roster_current AS
SELECT DISTINCT
    sa.application_id,
    sa.batch_id,
    sa.student_profile_id,
    u.real_name AS student_name,
    sp.student_no,
    bd.building_id,
    bd.building_name,
    sdr.start_date AS stay_start_date,
    sdr.end_date AS stay_end_date,
    sa.application_source
FROM stay_application sa
JOIN student_profile sp ON sp.student_profile_id = sa.student_profile_id
JOIN sys_user u ON u.user_id = sp.user_id
JOIN stay_application_scope sas ON sas.application_id = sa.application_id
JOIN stay_batch_building_rule sbr ON sbr.building_rule_id = sas.building_rule_id
JOIN building bd ON bd.building_id = sbr.building_id
JOIN (
    SELECT ranked.version_id, ranked.application_id
    FROM (
        SELECT r.version_id, v.application_id, r.review_status,
               ROW_NUMBER() OVER (
                   PARTITION BY r.version_id
                   ORDER BY r.review_id DESC
               ) AS rn
        FROM stay_review_record r
        JOIN stay_submission_version v ON v.version_id = r.version_id
    ) ranked
    WHERE ranked.rn = 1 AND ranked.review_status = 'APPROVED'
) latest_approval ON latest_approval.application_id = sa.application_id
 AND latest_approval.version_id = (
     SELECT current_version.version_id
     FROM stay_submission_version current_version
     WHERE current_version.application_id = sa.application_id
       AND current_version.submitted_at IS NOT NULL
     ORDER BY current_version.version_no DESC
     LIMIT 1
 )
JOIN stay_submission_version approved_version
  ON approved_version.version_id = latest_approval.version_id
 AND approved_version.application_id = sa.application_id
JOIN stay_date_range sdr ON sdr.version_id = approved_version.version_id
WHERE sa.current_status IN ('APPROVED', 'COMPLETED')
  AND sdr.start_date <= CURRENT_DATE()
  AND sdr.end_date >= CURRENT_DATE()
  AND NOT EXISTS (
      SELECT 1
      FROM stay_review_record pending_review
      JOIN stay_submission_version pending_version
        ON pending_version.version_id = pending_review.version_id
      WHERE pending_version.application_id = sa.application_id
        AND pending_review.review_status = 'PENDING'
  );

CREATE OR REPLACE VIEW v_stay_application_export AS
SELECT
    sa.application_id,
    sb.batch_code,
    sb.batch_name,
    sa.application_source,
    sa.current_status,
    sp.student_no,
    u.real_name AS student_name,
    u.phone,
    bd.building_code,
    bd.building_name,
    sv.version_no,
    dr.start_date,
    dr.end_date,
    rr.review_status AS latest_review_status,
    rr.reason AS latest_review_reason,
    sa.completed_at,
    sa.archived_at,
    sa.archive_reason
FROM stay_application sa
JOIN stay_batch sb ON sb.batch_id = sa.batch_id
JOIN student_profile sp ON sp.student_profile_id = sa.student_profile_id
JOIN sys_user u ON u.user_id = sp.user_id
LEFT JOIN stay_application_scope sas ON sas.application_id = sa.application_id
LEFT JOIN stay_batch_building_rule sbr ON sbr.building_rule_id = sas.building_rule_id
LEFT JOIN building bd ON bd.building_id = sbr.building_id
LEFT JOIN (
    SELECT ranked.*
    FROM (
        SELECT v.*,
               ROW_NUMBER() OVER (PARTITION BY v.application_id ORDER BY v.version_no DESC) AS rn
        FROM stay_submission_version v
        WHERE v.submitted_at IS NOT NULL
    ) ranked
    WHERE ranked.rn = 1
) sv ON sv.application_id = sa.application_id
LEFT JOIN stay_date_range dr ON dr.version_id = sv.version_id
LEFT JOIN (
    SELECT ranked.*
    FROM (
        SELECT r.*,
               ROW_NUMBER() OVER (
                   PARTITION BY r.version_id
                   ORDER BY r.review_id DESC
               ) AS rn
        FROM stay_review_record r
        JOIN stay_submission_version v ON v.version_id = r.version_id
    ) ranked
    WHERE ranked.rn = 1
) rr ON rr.version_id = sv.version_id;

CREATE OR REPLACE VIEW v_repair_evaluation_summary AS
SELECT
    ro.order_id,
    ro.order_no,
    COUNT(e.evaluation_id) AS evaluation_count,
    AVG(e.score) AS average_score
FROM repair_order ro
LEFT JOIN repair_result res ON res.order_id = ro.order_id
LEFT JOIN repair_confirmation c ON c.result_id = res.result_id
LEFT JOIN repair_evaluation e ON e.confirmation_id = c.confirmation_id
GROUP BY ro.order_id, ro.order_no;

-- Interval overlap, current-assignment uniqueness, active dispatch uniqueness,
-- and cross-table ownership checks require transactional locking/service validation.
-- Do not replace these checks with a stale cached status or denormalized count column.
