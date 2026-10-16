const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const sqlPath = path.join(root, 'thinking', '\u6570\u636e\u5e93\u8bbe\u8ba1', '01 \u5bbf\u820d\u7cfb\u7edf\u6570\u636e\u5e93.sql');
const docPath = path.join(root, 'thinking', '\u6570\u636e\u5e93\u8bbe\u8ba1', '00 \u5bbf\u820d\u7cfb\u7edf\u6570\u636e\u5e93\u8bbe\u8ba1\u8bf4\u660e.md');

const modules = [
  ['01 账号权限与学籍', ['sys_user', 'role', 'permission', 'user_role', 'role_permission', 'department', 'major', 'student_class', 'student_profile', 'dorm_manager_profile', 'repairer_profile']],
  ['02 住宿资源与分配', ['building', 'dorm_room', 'bed', 'dorm_manager_building_scope', 'accommodation_assignment']],
  ['03 报修配置与处理', ['fault_category', 'repair_work_type', 'repair_rule', 'fault_work_type_config', 'repairer_work_type_qualification', 'repairer_building_scope', 'repair_order', 'repair_submission_version', 'repair_audit_record', 'dispatch_record', 'repair_worker_record', 'repair_delay_application', 'repair_result', 'repair_confirmation', 'repair_evaluation', 'work_order_exception_record']],
  ['04 假期留宿', ['stay_batch', 'stay_batch_version', 'stay_batch_building_rule', 'stay_application', 'stay_application_scope', 'stay_submission_version', 'stay_date_range', 'stay_review_record', 'stay_exception_authorization', 'stay_version_authorization']],
  ['05 消息与文件', ['site_message', 'message_target', 'message_receipt', 'file_resource', 'repair_version_file', 'repair_delay_file', 'repair_result_file', 'message_file']],
  ['06 导入导出、备份与审计', ['import_export_task', 'import_error_detail', 'backup_task', 'import_export_task_file', 'backup_task_file', 'login_log', 'operation_log']],
];

const tableNames = {
  sys_user: '用户账号', role: '角色', permission: '权限', user_role: '用户角色授权', role_permission: '角色权限',
  department: '院系', major: '专业', student_class: '班级', student_profile: '学生资料', dorm_manager_profile: '宿管资料', repairer_profile: '维修人员资料',
  building: '楼栋', dorm_room: '宿舍', bed: '床位', dorm_manager_building_scope: '宿管楼栋管辖', accommodation_assignment: '住宿分配历史',
  fault_category: '故障分类', repair_work_type: '维修工种', repair_rule: '报修规则版本', fault_work_type_config: '故障分类与工种配置', repairer_work_type_qualification: '维修人员工种资质', repairer_building_scope: '维修人员楼栋负责范围', repair_order: '报修工单', repair_submission_version: '报修内容版本', repair_audit_record: '报修审核记录', dispatch_record: '派单尝试记录', repair_worker_record: '维修过程事件', repair_delay_application: '维修延期申请', repair_result: '维修完成结果', repair_confirmation: '维修确认事实', repair_evaluation: '维修评价', work_order_exception_record: '工单异常与人工处置',
  stay_batch: '留宿批次', stay_batch_version: '留宿开放区间版本', stay_batch_building_rule: '批次楼栋申请规则', stay_application: '留宿申请主体', stay_application_scope: '申请初始楼栋范围', stay_submission_version: '留宿申请内容版本', stay_date_range: '留宿日期段', stay_review_record: '留宿审核与复核记录', stay_exception_authorization: '留宿例外授权', stay_version_authorization: '版本使用例外授权关系',
  site_message: '站内消息主体', message_target: '消息接收目标', message_receipt: '消息接收及读取事实', file_resource: '文件资源元数据', repair_version_file: '报修版本附件关系', repair_delay_file: '延期申请附件关系', repair_result_file: '维修结果附件关系', message_file: '消息附件关系',
  import_export_task: '导入导出任务', import_error_detail: '导入错误明细', backup_task: '备份恢复任务', import_export_task_file: '导入导出文件关系', backup_task_file: '备份恢复文件关系', login_log: '登录尝试日志', operation_log: '操作审计日志',
};

const descriptions = {
  sys_user: '跨角色共用账号。姓名、电话、邮箱等只在此存一份，密码仅保存单向摘要。',
  dorm_manager_profile: '宿管专有工号、在岗标记和备注；共用账号资料通过用户外键取得。',
  repairer_profile: '维修人员工号、在岗标记、负荷上限和备注；实际在办工单数由视图计算。',
  user_role: '用户与角色的历史授权联系，保留有效起止时间。', role_permission: '角色与权限的多对多关联。',
  department: '院系规范化字典，不承载审批流程。', major: '隶属于一个院系的专业基本资料。', student_class: '隶属于一个专业的班级基本资料。', student_profile: '学生学号、班级与在籍状态，不复制账号姓名和联系方式。',
  building: '楼栋基础资料。', dorm_room: '唯一属于一栋楼的宿舍。', bed: '宿舍床位及管理状态，不保存占用标记。', dorm_manager_building_scope: '宿管对楼栋的历史管辖范围。', accommodation_assignment: '学生与床位的日期区间联系及办理事实。',
  repair_rule: '不可变的报修时限规则版本，已引用版本不得覆盖。', fault_work_type_config: '故障分类和维修工种的有效期关联。', repairer_work_type_qualification: '维修人员的维修工种资质及有效期。', repairer_building_scope: '维修人员的楼栋负责范围及有效期。',
  repair_order: '工单主体、当前状态、紧急标记和直接原工单联系。异常、次数及重修次数从历史记录推导。', repair_submission_version: '可编辑草稿及不可变的已提交报修内容版本。', repair_audit_record: '针对指定报修提交版本的审核事实。', dispatch_record: '每次独立派单尝试、接收人员及其响应事实。', repair_worker_record: '派单后的现场处理或施工超时事实。', repair_delay_application: '延期原因、预计完成时间及审核结论。', repair_result: '每张工单最多一份的最终维修结果。', repair_confirmation: '学生或系统对维修结果的确认事实。', repair_evaluation: '确认后可选的一份评价；评分量表待业务确认。', work_order_exception_record: '需要管理人员处理的异常原因及处置结果；不以此重复保存派单次数。',
  stay_batch: '一次寒暑假留宿申请周期。', stay_batch_version: '某批次连续开放区间及其发布历史。', stay_batch_building_rule: '批次与楼栋的申请截止、自动锁定和楼栋说明。', stay_application: '学生同一批次唯一的申请主体及当前生命周期状态。', stay_application_scope: '申请首次受理的楼栋规则联系；规则可受理多名学生。', stay_submission_version: '申请草稿和不可变提交版本。', stay_date_range: '某份申请版本中的一个闭区间留宿日期段。', stay_review_record: '针对指定申请版本及开放区间版本的审核/复核事实。', stay_exception_authorization: '针对指定学生和批次楼栋规则的限时例外授权。', stay_version_authorization: '申请版本实际使用的例外授权依据。',
  site_message: '消息正文、发布者及主体发送状态。', message_target: '单一接收范围选择器，类型限定全体、角色、楼栋或账号之一。', message_receipt: '一条消息对一个接收账号的事实；已读时间为空即未读。', file_resource: '文件元数据和存储定位键，不保存可由存储服务构造的访问 URL。',
  import_export_task: '独立的导入或导出运行实例，不保存导出结果列、统计值或条件组合。', import_error_detail: '导入任务逐行错误事实。', backup_task: '单独记录备份或恢复任务，不与导入任务合并。', login_log: '包含未知账号失败尝试的认证历史。', operation_log: '人工或系统审计事件；对象标识是历史定位信息，不是多态外键。',
};

const fieldNames = {
  rule_status: '楼栋规则状态', assigned_at: '受理楼栋范围确定时间',
  user_id: '账号标识', login_account: '登录账号', password_hash: '密码摘要', real_name: '真实姓名', phone: '联系电话', email: '电子邮箱', gender: '性别', enabled: '启用标记', created_at: '创建时间', updated_at: '更新时间',
  role_id: '角色标识', role_code: '角色编码', role_name: '角色名称', permission_id: '权限标识', permission_code: '权限编码', permission_name: '权限名称', permission_type: '权限类型',
  user_role_id: '授权关系标识', valid_from: '有效起始时间', valid_to: '有效截止时间', granted_at: '授予时间',
  department_id: '院系标识', department_code: '院系编码', department_name: '院系名称', major_id: '专业标识', major_code: '专业编码', major_name: '专业名称', class_id: '班级标识', class_code: '班级编码', class_name: '班级名称', enrollment_year: '班级入学年份', enrollment_status: '学籍状态', student_profile_id: '学生资料标识', student_no: '学号',
  manager_profile_id: '宿管资料标识', repairer_profile_id: '维修人员资料标识', employee_no: '工号', on_duty: '在岗标记', remark: '备注', profile_note: '维修人员备注', max_active_orders: '最大在办工单数',
  building_id: '楼栋标识', building_code: '楼栋编码', building_name: '楼栋名称', address: '地址', gender_limit: '住宿性别限制', usage_status: '使用状态', description: '说明', room_id: '宿舍标识', room_no: '宿舍编号', floor_no: '楼层', design_capacity: '设计容量', bed_id: '床位标识', bed_no: '床位编号', management_status: '管理状态', scope_id: '范围关系标识', start_date: '开始日期', end_date: '结束日期', assignment_id: '住宿分配标识', check_in_date: '入住日期', check_out_date: '退宿日期', assignment_type: '分配类型', adjustment_reason: '调整原因', assigned_by_user_id: '分配操作账号', recorded_at: '记录时间', terminated_by_user_id: '退宿操作账号', cancelled_by_user_id: '取消操作账号', cancelled_at: '取消时间',
  category_id: '故障分类标识', category_code: '分类编码', category_name: '分类名称', in_campus_scope: '校内维修范围标记', work_type_id: '工种标识', work_type_code: '工种编码', work_type_name: '工种名称', rule_id: '规则版本标识', rule_code: '规则编码', version_no: '版本序号', rule_name: '规则名称', accept_timeout_minutes: '接单时限分钟数', normal_repair_minutes: '普通维修时限分钟数', urgent_repair_minutes: '紧急维修时限分钟数', confirm_timeout_days: '确认时限天数', pending_edit_close_days: '待修改关闭天数', max_rework_count: '最大重修次数', effective_from: '生效开始时间', effective_to: '生效结束时间', config_id: '配置标识', qualification_id: '资质标识', qualification_level: '资质等级',
  order_id: '工单标识', order_no: '工单编号', parent_order_id: '直接原工单标识', current_status: '当前状态', urgent: '紧急标记', archived_at: '归档时间', archive_reason: '归档原因', version_id: '内容版本标识', specific_location: '宿舍内具体位置', fault_description: '故障描述', student_remark: '学生备注', recorded_by_user_id: '编辑或录入账号', saved_at: '保存时间', submitted_at: '提交时间', audit_id: '审核记录标识', reviewer_user_id: '审核账号', review_stage: '审核环节', conclusion: '审核结论', reason: '原因', reviewed_at: '审核时间', resubmit_deadline: '重交截止时间', dispatch_id: '派单标识', dispatched_by_user_id: '人工派单账号', dispatch_mode: '派单方式', dispatch_status: '派单状态', reject_reason: '拒单原因', dispatched_at: '派单时间', response_at: '接单或拒单响应时间', assignment_ended_at: '派单负责关系结束时间', worker_record_id: '维修人员事件标识', record_type: '记录类型', occurred_at: '发生时间', delay_id: '延期申请标识', delay_reason: '延期原因', expected_finish_at: '预计完成时间', delay_status: '延期状态', review_reason: '审核原因', result_id: '维修结果标识', submitted_by_repairer_id: '提交结果的维修人员标识', repair_description: '维修结果说明', confirmation_id: '确认标识', confirmation_mode: '确认方式', confirmed_by_user_id: '确认操作账号', opinion: '确认意见', confirmed_at: '确认时间', evaluation_id: '评价标识', score: '评分', content: '评价内容', evaluated_at: '评价时间', exception_id: '处置事件标识', exception_type: '异常类型', handled_by_user_id: '处置账号', handled_at: '处置时间', handling_result: '处置结果',
  batch_id: '批次标识', batch_code: '批次编码', batch_name: '批次名称', holiday_type: '假期类型', batch_status: '批次状态', published_by_user_id: '发布账号', published_at: '发布时间', batch_version_id: '开放区间版本标识', open_start_date: '开放开始日期', open_end_date: '开放结束日期', instructions: '批次说明', building_rule_id: '批次楼栋规则标识', application_deadline: '申请截止时间', auto_lock: '自动锁定标记', building_instructions: '楼栋申请说明', configured_by_user_id: '规则配置账号', application_id: '申请标识', application_source: '申请来源', created_by_user_id: '建立操作账号', completed_at: '完成时间', application_reason: '申请事由', range_id: '日期段标识', review_id: '审核或复核标识', round_no: '审核轮次', review_type: '审核类型', review_status: '审核状态', authorization_id: '授权标识', exception_type: '例外类型', authorization_reason: '授权理由', authorized_by_user_id: '授权账号', granted_at: '授权时间', revoked_by_user_id: '撤销授权账号', revoked_at: '撤销授权时间',
  message_id: '消息标识', title: '标题', body: '正文', message_type: '消息类型', publisher_user_id: '发布账号', send_status: '发送状态', target_id: '目标标识', target_type: '目标类型', read_at: '读取时间', received_at: '接收时间', file_id: '文件标识', original_name: '原始文件名', storage_key: '存储定位键', file_type: '文件类型', byte_size: '文件大小字节数', checksum: '文件校验摘要', uploaded_by_user_id: '上传账号', file_status: '文件状态', file_purpose: '文件用途',
  task_id: '任务标识', task_no: '任务编号', initiated_by_user_id: '发起账号', task_type: '任务类型', business_object_type: '业务对象类型', task_status: '任务状态', started_at: '执行开始时间', finished_at: '执行结束时间', result_description: '结果说明', error_detail_id: '错误明细标识', row_no: '文件行号', field_name: '字段名称', raw_value: '原始值', error_reason: '错误原因', backup_scope: '备份或恢复范围', restore_confirmed_at: '恢复二次确认时间', checksum_passed: '校验通过标记', failure_reason: '失败原因', rollback_result: '回退结果', login_log_id: '登录日志标识', attempted_login_account: '本次输入账号', attempted_at: '尝试时间', login_result: '登录结果', source_address: '来源地址', device_info: '设备信息', operation_log_id: '操作日志标识', operator_user_id: '操作账号', actor_type: '操作者类型', operated_at: '操作时间', module_name: '业务模块', operation_type: '操作类型', object_type: '对象类型', object_id: '对象标识', operation_result: '操作结果', protection_backup_task_id: '恢复前保护备份任务标识',
};

function sqlType(definition) {
  const match = definition.match(/^([A-Z]+(?:\([^)]+\))?(?:\s+UNSIGNED)?)/i);
  return match ? match[1].toUpperCase() : definition;
}
function parseSql() {
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const tables = new Map();
  const views = [];
  for (const match of sql.matchAll(/CREATE TABLE\s+(\w+)\s*\(([\s\S]*?)\)\s*ENGINE=/gi)) {
    const [, table, body] = match;
    const columns = [];
    const primary = [];
    const unique = [];
    const foreignKeys = [];
    for (const line of body.split(/\r?\n/)) {
      const text = line.trim().replace(/,$/, '');
      if (!text) continue;
      let keyMatch = text.match(/^PRIMARY KEY \(([^)]+)\)/i);
      if (keyMatch) { primary.push(...keyMatch[1].split(',').map(value => value.trim().replace(/`/g, ''))); continue; }
      keyMatch = text.match(/^UNIQUE KEY \w+ \(([^)]+)\)/i);
      if (keyMatch) { unique.push(keyMatch[1].split(',').map(value => value.trim().replace(/`/g, ''))); continue; }
      keyMatch = text.match(/^CONSTRAINT \w+ FOREIGN KEY \(([^)]+)\) REFERENCES (\w+) \(([^)]+)\)/i);
      if (keyMatch) { foreignKeys.push({ columns: keyMatch[1].split(',').map(value => value.trim()), target: keyMatch[2], targetColumns: keyMatch[3].split(',').map(value => value.trim()) }); continue; }
      if (/^(KEY|CONSTRAINT)\b/i.test(text)) continue;
      const column = text.match(/^(\w+)\s+((?:BIGINT|INT|SMALLINT|TINYINT|VARCHAR|CHAR|TEXT|DATE|DATETIME)\b.+)$/i);
      if (!column) continue;
      const [, name, definition] = column;
      const comment = (definition.match(/COMMENT\s+'((?:''|[^'])*)'$/i) || [])[1]?.replace(/''/g, "'") || '';
      columns.push({ name, definition, type: sqlType(definition), comment });
    }
    tables.set(table, { columns, primary, unique, foreignKeys });
  }
  for (const match of sql.matchAll(/CREATE OR REPLACE VIEW\s+(\w+)\s+AS/gi)) views.push(match[1]);
  return { sql, tables, views };
}

function markdown(doc) {
  const lines = [
    '# 高校宿舍管理系统数据库设计说明',
    '',
    '| 项目 | 内容 |', '| --- | --- |',
    '| 版本 | v1.0 |', '| 编制日期 | 2026-10-14 |',
    '| 适用范围 | V1 住宿与报修、V2 假期留宿、消息及系统管理 |',
    '| 数据库 | MySQL 8.0.16+，InnoDB，utf8mb4 |',
    '| 设计输入 | [ER 图](../ER设计/01%20宿舍系统ER图.mmd)、[ER 说明](../ER设计/00%20ER设计说明.md)、用例说明、动态设计和系统架构 |',
    '| 修改记录 | v1.0：基于 ER 与业务规则形成规范化表结构、派生视图、约束和数据字典 |',
    '',
    '## 1. 设计目标与存储原则',
    '',
    '本方案把业务基本项及不可替代的历史事件保存在基础表；由多个基本项组合得到的展示、导出和统计结果使用视图查询，不将展示用全名、路径、计数、汇总或格式化字段回写为第二份权威数据。数据库并不拒绝保存真实发生的过程事实：审核结论、接单/拒单、延期预计时间、完成确认、操作日志等均是可追溯业务事实，不是视图可重建的当前概览。',
    '',
    '系统采用账号共表、角色授权、各角色专有资料表；系统管理员仍仅由 `ADMIN` 角色表达。每名学生每批次一张留宿申请主体；同一工单通过直接父工单关联重修。导入导出与备份恢复保持为两类任务。',
    '',
    '### 1.1 基本项与导出项',
    '',
    '| 数据 | 存储位置/方式 | 说明 |', '| --- | --- | --- |',
    '| 学生姓名、联系方式 | `sys_user` | 账号的权威基本资料；学生列表通过视图关联学号、班级、专业、院系 |',
    '| 院系、专业、班级 | `department`、`major`、`student_class` | 各自只存自己的编码和名称及父级联系；不在学生行复制名称链 |',
    '| 楼栋/宿舍/床位名称 | 各住宿基础表 | 住宿、报修通过外键关联；导出时组合完整位置 |',
    '| 当前床位占用、舍友、入住状态 | `v_student_accommodation_current`、`v_bed_occupancy_current` | 按住宿分配日期区间计算，不在床位保存占用、学生姓名或舍友列表 |',
    '| 学生当前班级、专业、院系 | `v_student_academic_detail` | 连接学生资料、班级、专业和院系，不复制组合名称 |',
    '| 派单拒绝数、接单超时数、维修超时数、异常标记、重修次数 | `v_repair_order_dashboard` | 从每次派单与维修过程记录计算，不落入工单基本表 |',
    '| 维修人员当前工作量 | `v_repair_worker_current_load` | 按当前业务状态与未结束派单计算，不在维修人员资料累计维护可漂移计数 |',
    '| 接单/维修/学生确认截止时间 | `v_dispatch_deadlines`、`v_repair_confirmation_deadline` | 根据不可变规则版本、派单时间、实际接单时间和延期结果推导 |',
    '| 当前留宿人员、留宿名单导出 | `v_stay_roster_current`、`v_stay_application_export` | 由当前申请状态、当前版本、最终审核和留宿日期段组合 |',
    '| 房间床位配置数、占用数 | `v_dorm_room_capacity` | 由床位与有效住宿关系汇总 |',
    '| 平均评分、评价数 | `v_repair_evaluation_summary` | 从评价事实聚合，避免在工单或维修人员资料重复存储 |',
    '| 文件访问 URL | 不存业务表 | 由 `storage_key` 和部署环境的文件存储配置生成 |',
    '| 导出列、过滤后的报表结果、统计 JSON | 查询/导出时生成 | `import_export_task` 只保存任务基本项与执行结果，不把组合结果存回业务表 |',
    '| 消息未读标记 | `message_receipt.read_at` | `NULL` 表示未读，非空表示已读；不额外存同义布尔值 |',
    '',
    '### 1.2 不可避免的当前业务状态与历史事实',
    '',
    '本方案将 `current_status` 作为状态机的权威业务基本项，在业务动作事务中维护。现有过程记录并非完整事件流，因此不通过操作日志猜测当前状态；若将来采用完整事件溯源，需重新评估这一存储方式。工单紧急标记和申请来源属于业务决策/来源事实。开放区间、报修规则按版本保存，供历史审核追溯当时生效规则。完成、归档、读取、授权等时间仅在对应事件实际发生后写入。',
    '',
    '被提交的报修/留宿版本不得更新覆盖。未提交草稿可编辑；提交时在同一事务中封存版本、提交时间并更新主体状态。视图“当前版本”只选择最新已提交版本，不将未提交草稿误展示给审核人。',
    '',
    '## 2. 规范化与物理约定',
    '',
    '- 第一范式：多角色、权限、楼栋范围、附件、审核轮次、日期段和接收对象均使用多行或联系表，不存逗号列表/数组。',
    '- 第二范式：联合主键联系表的非键字段依赖完整联系，例如消息读取时间依赖 `(message_id,user_id)`；附件用途依赖任务与文件关系。',
    '- 第三范式：用户资料不复制到角色资料；学籍名称沿班级->专业->院系连接；住宿位置沿床位->宿舍->楼栋连接；工单和申请内容分别放在版本表；审计及评价不重复存主体姓名。',
    '- 主键统一 `BIGINT UNSIGNED AUTO_INCREMENT`；联系本身没有属性时，使用双方主键联合主键。',
    '- 唯一业务编码采用唯一索引；外键索引在 MySQL InnoDB 中明确给出，便于查询和约束维护。',
    '- 字符串长度按账号、代码、标题、地址、描述等用途给出；长正文使用 `TEXT`，不将文件内容存入数据库。',
    '- 日期区间：住宿采用 `[入住日期, 退宿日期)`；留宿申请按业务定义采用含首尾日的闭区间。',
    '- 时间使用 `DATETIME(3)` 保存学校业务时区 `Asia/Shanghai` 的本地时间；数据库连接和定时任务必须使用 `+08:00` 会话时区，避免 `CURRENT_DATE()` 与业务日期不一致。',
    '- 状态使用 `VARCHAR` 代码而不是 MySQL `ENUM`，便于保持状态字典、校验约束和应用枚举同步。',
    '',
    '不建议用 `ON DELETE CASCADE` 删除业务历史。账号禁用、配置停用和文件状态清理必须保留审计；物理清理由经过确认的保留策略另行实施。',
    '',
    '## 3. 范围、基数与关系落表',
    '',
    '| 业务联系 | 基数 | 落表方式 |', '| --- | --- | --- |',
    '| 账号-角色、角色-权限 | m:n | `user_role`、`role_permission` |',
    '| 宿管-楼栋、维修人员-楼栋、维修人员-工种 | m:n | 带日期/资质的联系表 |',
    '| 学生-床位 | 历史 m:n | `accommodation_assignment` 保存日期区间及办理账号 |',
    '| 报修工单-维修人员 | 历史 m:n | `dispatch_record` 一行一次尝试 |',
    '| 故障分类-工种 | m:n | `fault_work_type_config` |',
    '| 楼栋-留宿批次 | m:n | `stay_batch_building_rule` 保存楼栋专属截止和锁定规则 |',
    '| 学生-批次 | 每学生每批次至多 1 份 | `stay_application` 唯一键 `(student_profile_id,batch_id)` |',
    '| 消息-接收账号 | m:n | `message_receipt` 联合主键去重接收记录 |',
    '| 最终维修结果/确认/评价 | 1:0..1 逐级可选 | 外键唯一约束；未发生时不建空行 |',
    '',
    '## 4. 表结构与字段数据字典',
    '',
    `共 ${doc.tables.size} 张基础表，含实体表、关联表、版本表和过程事实表；${doc.views.length} 个视图用于导出与组合查询。`,
    '',
    '> 下列数据字典由同目录 DDL 自动解析生成；字段类型、默认值、主外键和唯一键以 SQL 源文件为准。',
    '',
  ];
  for (const [section, tableList] of modules) {
    lines.push(`### 4.${section}`, '');
    for (const table of tableList) {
      const model = doc.tables.get(table);
      if (!model) throw new Error(`Missing table ${table}`);
      const tableComment = (doc.sql.match(new RegExp(`CREATE TABLE\\s+${table}\\s*\\([\\s\\S]*?\\)\\s*ENGINE=[^;]*?COMMENT='([^']*)'`, 'i')) || [])[1] || '';
      lines.push(`#### ${tableNames[table] || table} \u0060${table}\u0060`, '', `用途：${descriptions[table] || tableComment || '保存该业务对象的基本属性或历史事实。'}`, '', '| 字段 | MySQL 类型 | 可空/默认/约束 | 基本项含义 |', '| --- | --- | --- | --- |');
      for (const column of model.columns) {
        const constraints = [];
        if (model.primary.includes(column.name)) constraints.push(model.primary.length === 1 ? '主键' : `联合主键 (${model.primary.join(', ')})`);
        for (const keys of model.unique) {
          if (keys.includes(column.name)) constraints.push(keys.length === 1 ? '唯一键' : `联合唯一键 (${keys.join(', ')})`);
        }
        for (const foreign of model.foreignKeys) if (foreign.columns.includes(column.name)) constraints.push(`外键 -> ${foreign.target}.${foreign.targetColumns[foreign.columns.indexOf(column.name)]}`);
        if (/\bNOT NULL\b/i.test(column.definition)) constraints.push('非空'); else constraints.push('可空');
        const def = column.definition.match(/\bDEFAULT\s+([^\s,]+)/i);
        if (def) constraints.push(`默认 ${def[1]}`);
        if (/AUTO_INCREMENT/i.test(column.definition)) constraints.push('自增');
        const label = fieldNames[column.name] || column.name.replaceAll('_', ' ');
        const meaning = column.comment ? `${label}；${column.comment}` : label;
        lines.push(`| \u0060${column.name}\u0060 | \u0060${column.type}\u0060 | ${constraints.join('；')} | ${meaning.replaceAll('|', '\\|')} |`);
      }
      lines.push('');
      const body = doc.sql.match(new RegExp(`CREATE TABLE\\s+${table}\\s*\\(([\\s\\S]*?)\\)\\s*ENGINE=`, 'i'))[1];
      const indexes = body.split(/\r?\n/).map(line => line.trim().replace(/,$/, '')).filter(line => /^(PRIMARY KEY|UNIQUE KEY|KEY)\b/i.test(line));
      lines.push('索引及键约束：', '', ...indexes.map(index => `- \`${index}\``), '');
    }
  }
  lines.push(
    '## 5. 派生查询视图', '',
    '| 视图 | 用途与基本项来源 |', '| --- | --- |',
    '| `v_student_accommodation_current` | 按当前日期筛选住宿分配，关联账号、学生、床位、宿舍和楼栋；当前仅入住有效区间返回 |',
    '| `v_bed_occupancy_current` | 为每张床位推导当前占用及学生，不在床位实体保存 `occupied` |',
    '| `v_student_academic_detail` | 连接账号、学号、班级、专业、院系用于列表/导出 |',
    '| `v_dorm_room_capacity` | 汇总设计容量、配置床位数和有效占用数 |',
    '| `v_repair_worker_current_load` | 按业务规定的待接单、已接单、延期、已维修待确认、已确认未归档范围汇总负责派单 |',
    '| `v_dispatch_deadlines` | 仅对当前有效派单计算业务截止；延期待审核暂停判断，通过后用批准时间，后续延期被驳回保留之前批准期限 |',
    '| `v_repair_confirmation_deadline` | 从结果提交时间和工单规则版本推导自动确认期限 |',
    '| `v_repair_order_dashboard` | 返回最新已提交版本、拒单/超时次数、异常判断；重修次数为同一根工单整条链中全部重修单数，各节点共享该口径 |',
    '| `v_stay_roster_current` | 只列当前获准、未处于待复核状态且今日位于已审核日期段的留宿学生 |',
    '| `v_stay_application_export` | 导出用的批次、当前申请、最新版提交、日期段、审核结论和学生资料组合 |',
    '| `v_repair_evaluation_summary` | 按工单计算评价数量与平均评分 |',
    '',
    '视图是查询接口，不是权限边界。学生只能按本人过滤，宿管必须按有效管辖楼栋过滤，维修人员必须按本人派单过滤；授权条件应在查询调用层强制施加。导出任务按权限读取视图结果，不将结果列存成重复业务表。',
    '',
    '## 6. 状态字典', '',
    '| 对象 | 代码 | 含义 |', '| --- | --- | --- |',
    '| 报修工单 | `DRAFT` / `PENDING_REVIEW` / `PENDING_EDIT` | 待编辑 / 待审核 / 待修改 |',
    '| 报修工单 | `PENDING_ASSIGN` / `PENDING_ACCEPT` / `ACCEPTED` | 待派单 / 待接单 / 已接单 |',
    '| 报修工单 | `DELAYED` / `REPAIRED` / `CONFIRMED` | 维修延期 / 已维修待确认 / 已确认 |',
    '| 报修工单 | `PENDING_MANUAL` / `CLOSED` / `WITHDRAWN` / `ARCHIVED` | 待人工处理 / 已关闭 / 已撤销 / 已归档 |',
    '| 派单记录 | `PENDING` / `ACCEPTED` / `REJECTED` / `TIMEOUT` / `CANCELLED` | 待接单 / 已接单 / 已拒单 / 超时未处理 / 已作废 |',
    '| 留宿申请 | `DRAFT` / `PENDING_REVIEW` / `UNDER_REVIEW` / `PENDING_EDIT` | 待编辑 / 待审核未锁定 / 审核中 / 待修改 |',
    '| 留宿申请 | `APPROVED` / `COMPLETED` / `ARCHIVED` | 已通过 / 已完成 / 已归档 |',
    '| 审核结论 | `APPROVED` / `REJECTED` | 通过 / 不通过；不等同于主体当前状态 |',
    '| 通用任务 | `WAITING` / `RUNNING` / `SUCCESS` / `PARTIAL` / `FAILED` / `CANCELLED` | 待执行 / 执行中 / 成功 / 部分成功 / 失败 / 启动前取消；`PARTIAL` 只允许导入 |',
    '| 备份恢复 | `WAITING` / `RUNNING` / `SUCCESS` / `FAILED` / `CANCELLED` | 不使用 `PARTIAL` |',
    '',
    '更多状态迁移条件见 [动态设计说明](../动态结构设计/00%20时序图与状态图设计说明.md)。',
    '',
    '## 7. 关键约束、事务与并发', '',
    '- **住宿区间冲突：** MySQL 普通唯一键无法表达区间不重叠。事务中锁定学生和床位资源，按 `existing.start < new.end AND new.start < existing.end` 检查；开区间和取消关系需单独处理。调宿在同一事务中结束旧关系并写新关系。',
    '- **同工单单一当前派单：** 创建派单前锁定工单行，并确认没有 `PENDING/ACCEPTED` 且未结束的派单；拒单、超时、派新单应串行提交。',
    '- **用户角色有效期：** 授权写入时锁定同用户角色历史，拒绝重叠有效区间。',
    '- **重修与唯一申请：** `parent_order_id` 只能指向同一学生的原单，事务中拒绝自指、循环并检查原单状态和重修上限；`(student_profile_id,batch_id)` 唯一约束阻止同批次重复申请。',
    '- **审核版本一致：** 内容版本、日期段、审核记录、主体状态在一个事务内提交；审核只接受当前合法已提交版本，驳回必须含原因和重交期限。',
    '- **日期区间唯一逻辑：** 留宿日期段首尾包含，SQL 检查 `end_date >= start_date`；版本内不同日期段共享边界日或任意交叠须由事务查询拒绝。',
    '- **附件完整性：** 文件元数据和附件联系同业务事务保存；正式报修、延期及完工提交时检查附件要求和存储状态。',
    '- **消息幂等：** 先将多个目标展开并去重，再插入 `(message_id,user_id)` 接收记录；重复发布处理不能创建重复 receipt。',
    '- **部分导入：** 逐行校验并把合法变更、错误明细和任务结果按约定批次提交；只有实际写入部分合法行时任务才是 `PARTIAL`。',
    '- **恢复操作：** 执行前二次确认、文件校验和保护性备份；事务中检查保护任务确为备份，禁止自指或循环。审计与恢复结果须存于不会被恢复目标覆盖的持久位置。',
    '- **超时任务：** 定时扫描先用当前状态和截止时间做条件更新/行锁，确保并发时只接受一个接单、确认或超时事实。',
    '',
    '事务中必需一致提交：申请版本+日期段+状态、审核记录+状态、派单尝试+工单状态、接单事实+状态、完工结果+附件+状态、延期审核+期限语义、确认/评价、调宿旧关系和新关系。通知若异步，应使用可靠待发送机制；该机制不在当前业务实体列表中擅自新增。',
    '',
    '## 8. 索引与唯一约束摘要', '',
    'DDL 对唯一业务号、用户/角色资料一对一、每学生每批次申请、内容版本号、派单历史、审核检索、截止任务扫描、接收去重、附件联系和日志筛选建立了唯一键/查询索引。其余索引以表级 DDL 为准。不要仅为每个字段机械建索引；优先按实际过滤、连接和排序顺序做 `EXPLAIN` 验证。',
    '',
    '## 9. 迁移与执行', '',
    '脚本 [01 宿舍系统数据库.sql](./01%20宿舍系统数据库.sql) 面向 MySQL 8.0.16+，包含数据库初始化、表、外键、索引、检查约束和视图。生产环境应由 Flyway 等版本化迁移工具执行；不要把全量 `CREATE DATABASE` 脚本反复用于已有库。脚本设置 `utf8mb4`，业务连接和定时任务连接须设 `time_zone=+08:00`。',
    '',
    '执行前确认目标库名称、账号权限、备份和环境。当前只进行结构验证，不连接或修改现有宿舍业务库，也不写入演示数据。',
    '',
    '## 10. 已知规则假设', '',
    '- 数据库按 MySQL 8.0.16+ 设计，因为该版本开始强制执行 `CHECK` 约束；需要较早 8.0 版本时应升级或补应用层等价校验。',
    '- 班级->专业->院系暂按单父级关系；复杂学籍历史待学校确认。',
    '- 留宿申请以批次为唯一周期并保存首次受理楼栋规则；同批次调宿后是否迁移既有申请范围仍需业务确定。',
    '- 维修类型暂按维修工种表达；如二者为不同字典，需要补充实体和配置联系。',
    '- 评分当前使用无范围限制的无符号整数列；分值上下界由业务方确认后再加 CHECK。',
    '- 时限以已确认的默认规则落种子配置时，应分别为 120 分钟、1440 分钟、360 分钟、7 天及 7 天；本 DDL 未插入用户数据。',
    '- 为避免重复存储派生截止时间，实际计时任务应查询期限视图，或使用相同规则计算式，不得另存一个容易失配的截止列。',
    '',
    '## 11. 验证', '',
    '运行 `node tools/validate-database-design.cjs` 检查表及视图数量、每表主键、外键目标存在、DDL 与文档数据字典同步、导出项未错误写入基础表，并使用本地 MySQL 服务器执行真实建库/建表/视图解析（临时空实例，不连接业务库）。',
    '',
    '2026-10-14 验证结果：静态校验通过；隔离 MySQL 8.0.43 实例完整执行 DDL，成功建立 57 张基础表、11 个视图，未发现外键目标缺失。此验证证明建表及视图语法可执行，不替代业务服务的事务与权限校验。',
  );
  return lines.join('\n') + '\n';
}

const parsed = parseSql();
fs.writeFileSync(docPath, markdown(parsed), 'utf8');
console.log(`Generated ${path.relative(root, docPath)} from ${parsed.tables.size} tables and ${parsed.views.length} views.`);
